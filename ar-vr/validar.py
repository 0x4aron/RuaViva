"""Validação visual, determinística e de desempenho da cena em Full HD."""
import argparse
import asyncio
import hashlib
import json
from pathlib import Path

from playwright.async_api import async_playwright

FRAMES = [1, 4, 8, 12, 17, 22, 26, 31, 35, 38, 38.5, 38.6, 39.25, 40, 40.5, 41, 41.5, 42, 42.6, 43, 43.2, 43.5, 46.5]
EXPECTED = [(1, 3, 71, 3), (2, 8, 59, 2), (3, 10, 57, 1)]


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://localhost:8000/ar-vr/cena/')
    parser.add_argument('--saida', type=Path, default=Path(__file__).parent / 'quadros' / 'validacao')
    parser.add_argument('--limite-ms', type=float, default=120)
    args = parser.parse_args()
    if 'preview=' in args.url:
        parser.error('Use a URL sem preview: o relógio deve estar parado.')
    args.saida.mkdir(parents=True, exist_ok=True)
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1)
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(args.url, wait_until='load')
        await page.wait_for_function('window.cenaPronta || window.cenaErro', timeout=120000)
        assert not await page.evaluate('window.cenaErro || null'), 'Falha ao carregar a cena'
        info = await page.evaluate('window.cenaInfo')
        assert [(x['id'], x['databaseId'], x['score'], x['supports']) for x in info['ocorrencias']] == EXPECTED
        assert await page.evaluate('window.renderizar(-10)') == 0
        assert await page.evaluate('window.renderizar(99)') == 48
        assert await page.evaluate("""() => [NaN, Infinity, '17', undefined].every(value => {
            try { window.renderizar(value); return false; } catch (error) { return error instanceof TypeError; }
        })""")
        for t in FRAMES:
            await page.evaluate('(t) => window.renderizar(t)', t)
            await page.locator('#filme').screenshot(path=str(args.saida / f't-{t:05.2f}.png'))
        # Pixels incluem HTML: verifica reversibilidade também durante os reparos.
        hashes = {}
        for t in [17, 24, 38.6, 40.5, 42.6, 43.5]:
            await page.evaluate('(t) => window.renderizar(t)', t)
            before = await page.locator('#filme').screenshot()
            for jump in [48, 0, 43.5, 12, t]:
                await page.evaluate('(t) => window.renderizar(t)', jump)
            after = await page.locator('#filme').screenshot()
            assert before == after, f'Pixels diferentes após saltos no instante {t}'
            hashes[str(t)] = hashlib.sha256(before).hexdigest()
        await page.evaluate('window.renderizar(24)')
        assert await page.locator('.estado').all_text_contents() == ['71 pontos · 3 apoios', '59 pontos · 2 apoios', '57 pontos · 1 apoio']
        # Cada resolução deve aparecer já no marco, inclusive voltando no tempo.
        for t, resolved in [(41.5, 3), (38.49, 0), (38.5, 1), (39.99, 1), (40, 2), (41.49, 2), (43, 3)]:
            await page.evaluate('(t) => window.renderizar(t)', t)
            states = await page.locator('.estado').all_text_contents()
            assert states.count('Resolvido') == resolved, (t, states)
            assert states[:resolved] == ['Resolvido'] * resolved
            assert await page.locator('.etiqueta[data-mode="resolved"]').evaluate_all("""cards => cards.every(card => {
                const style = getComputedStyle(card);
                return style.backgroundColor === 'rgb(230, 243, 236)' && style.color === 'rgb(30, 125, 79)';
            })"""), f'Cores de resolução incorretas em {t}'
            if t in (38.5, 40, 43):
                assert await page.locator('.etiqueta:not([hidden]) .estado').all_text_contents() == ['Resolvido']
        await page.evaluate('window.renderizar(43.5)')
        assert await page.locator('.estado').all_text_contents() == ['Resolvido'] * 3
        # Primeiro aquece os estados de material; registra CPU e GPU separadamente.
        await page.evaluate('() => { for (const t of [0, 17, 24, 35, 40, 43.5]) window.renderizar(t); }')
        metrics = []
        issues = []
        for frame in range(1441):
            t = frame / 30
            result = await page.evaluate("""t => {
                const canvas = document.querySelector('#cena canvas');
                const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
                gl.finish();
                const start = performance.now();
                window.renderizar(t);
                const cpu = performance.now() - start;
                gl.finish();
                const complete = performance.now() - start;
                const cards = [...document.querySelectorAll('.etiqueta:not([hidden])')];
                const rects = cards.map(card => card.getBoundingClientRect());
                const issue = [];
                cards.forEach((card, i) => {
                    for (const text of card.querySelectorAll('strong, .endereco, .estado')) {
                        if (parseFloat(getComputedStyle(text).fontSize) < 28) issue.push('fonte pequena');
                    }
                    const a = rects[i];
                    if (a.left < 0 || a.right > 1920 || a.top < 130 || a.bottom > 900) issue.push('etiqueta fora da área segura');
                    rects.slice(i + 1).forEach(b => {
                        if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) issue.push('etiquetas sobrepostas');
                    });
                });
                const caption = document.querySelector('#legenda');
                if (getComputedStyle(caption).backgroundColor !== 'rgba(31, 42, 48, 0.8)') issue.push('contraste da legenda');
                if (document.querySelectorAll('#legenda').length !== 1) issue.push('legendas duplicadas');
                const active = [[5,13],[13,21],[21,29],[29,38],[38,44]].some(([a,b]) => t >= a && t < b);
                if (Boolean(caption.textContent) !== active) issue.push('legenda fora do intervalo');
                return {t, cpu, complete, issue};
            }""", t)
            metrics.append({k: v for k, v in result.items() if k != 'issue'})
            if result['issue']:
                issues.append({'t': t, 'issues': result['issue']})
            if frame % 300 == 0:
                print(f'Validando {t:.0f}/48 s', flush=True)
        renderer = await page.evaluate("""() => {
            const canvas = document.querySelector('#cena canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            const debug = gl.getExtension('WEBGL_debug_renderer_info');
            return debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
        }""")
        cpu_times = sorted(m['cpu'] for m in metrics)
        summary = {'maximo_ms': max(cpu_times), 'p95_ms': cpu_times[int(len(cpu_times) * .95)], 'gpu_sincronizada_max_ms': max(m['complete'] for m in metrics)}
        report = {'browser': browser.version, 'renderer': renderer, 'cena': info, 'resumo': summary, 'limite_ms': args.limite_ms, 'hashes': hashes, 'erros': errors, 'problemas': issues, 'medicoes': metrics}
        (args.saida / 'resultado.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        await browser.close()
        assert not errors, errors
        assert not issues, issues[:5]
        assert summary['maximo_ms'] < args.limite_ms, f'Meta de desempenho excedida: {summary}'
        print(json.dumps(summary, ensure_ascii=False))
        print(f'Validação concluída: {args.saida.resolve()}')


if __name__ == '__main__':
    asyncio.run(main())
