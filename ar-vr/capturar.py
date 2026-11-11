"""Captura determinística do filme completo, incluindo legendas HTML."""
import argparse
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://localhost:8000/ar-vr/cena/')
    parser.add_argument('--saida', type=Path, default=Path(__file__).parent / 'quadros')
    parser.add_argument('--fps', type=int, default=30)
    args = parser.parse_args()
    if args.fps < 1:
        parser.error('--fps deve ser positivo')
    if 'preview=' in args.url:
        parser.error('A captura deve usar uma URL sem preview')
    args.saida.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1)
        await page.goto(args.url, wait_until='load')
        await page.wait_for_function('window.cenaPronta === true || !!window.cenaErro', timeout=120000)
        error = await page.evaluate('window.cenaErro || null')
        if error:
            raise RuntimeError(error)
        await page.evaluate('document.fonts.ready')
        # Verifica saltos no tempo: voltar ao mesmo instante deve produzir os mesmos pixels.
        await page.evaluate('window.renderizar(24)')
        first = await page.locator('#filme').screenshot()
        for t in [42, 7, 31, 0, 24]:
            await page.evaluate('(t) => window.renderizar(t)', t)
        repeated = await page.locator('#filme').screenshot()
        if first != repeated:
            raise RuntimeError('O quadro de 24s mudou após saltos no tempo.')
        total = 48 * args.fps
        for frame in range(total):
            await page.evaluate('(t) => window.renderizar(t)', frame / args.fps)
            await page.locator('#filme').screenshot(path=str(args.saida / f'{frame:05d}.png'))
            if frame % args.fps == 0:
                print(f'Capturando {frame // args.fps:02d}/48 s', flush=True)
        await browser.close()
        print(f'{total} quadros gravados em {args.saida.resolve()}')


if __name__ == '__main__':
    asyncio.run(main())
