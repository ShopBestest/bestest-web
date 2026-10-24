#!/usr/bin/env python3
"""Build the VDPs Template head custom code (Phase 4, 2026-10-24).

vdp.css is inlined (it was a render-blocking jsDelivr request) and the hero photo is
preloaded from the hero-srcset CMS field. css/vdp.css stays the source of truth: edit it,
run this, paste dist/vdp-head.html into the VDPs Template head (or write it via the
Webflow MCP set_page_freeform_code). Webflow's page custom-code limit is 50,000 chars.

    python3 tools/vdp_head.py          # writes dist/vdp-head.html, prints sizes
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LIMIT = 50_000

def wf(field):
    # Webflow's stored form of a CMS binding inside page custom code
    return '{{wf {&quot;path&quot;:&quot;%s&quot;,&quot;type&quot;:&quot;PlainText&quot;\\} }}' % field

# Slider sizing used to sit in the template footer, which arrives after first paint.
# It has to be in the head now that slide 1 is server-rendered.
SLIDER_CSS = """
.w-slider-nav { display: none; }
.slider-3 { width: 100%; aspect-ratio: 4 / 3; height: auto; background: #f0f0f0; }
.mask-2 { width: 100%; height: 100%; }
.slide-2 { width: 100%; height: 100%; position: relative; }
.image-3 { width: 100%; height: 100%; object-fit: cover; display: block; position: absolute; top: 0; left: 0; }
img[data-bst-hero]:not([srcset*="http"]) { visibility: hidden; }
"""

# Same breakpoints as the live slider: ~full width to 479px, ~half the viewport above.
HERO_SIZES = '(max-width: 479px) 100vw, 52vw'

def minify(css):
    """Conservative: drop comments, collapse whitespace, trim around { } ; , only.
    Quoted strings (content: values, font names) are set aside first and put back untouched."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    strings = []
    def keep(m):
        strings.append(m.group(0))
        return '\0%d\0' % (len(strings) - 1)
    css = re.sub(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', keep, css)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([{};,])\s*', r'\1', css)
    css = css.replace(';}', '}')
    return re.sub(r'\0(\d+)\0', lambda m: strings[int(m.group(1))], css).strip()

def build():
    css = (ROOT / 'css/vdp.css').read_text()
    if '</' in css:
        sys.exit('vdp_head.py: "</" in vdp.css would close the <style> tag')
    style = minify(SLIDER_CSS + css)
    head = '\n'.join([
        '<meta property="og:image" content="%s">' % wf('hero-image-url'),
        '<meta property="og:image:secure_url" content="%s">' % wf('hero-image-url'),
        '',
        '<link rel="canonical" href="https://shopbestest.com/used/%s">' % wf('slug'),
        '',
        '<!-- Phase 4 (2026-10-24): hero photo preload (hero-srcset = Airtable hero_srcset) -->',
        '<link rel="preconnect" href="https://res.cloudinary.com">',
        '<link rel="preload" as="image" fetchpriority="high" imagesrcset="%s" imagesizes="%s">' % (wf('hero-srcset'), HERO_SIZES),
        '',
        '<!-- VDP styles: bestest-web css/vdp.css, inlined by tools/vdp_head.py. Edit the source, rebuild, repaste. -->',
        '<style id="bst-vdp-css">%s</style>' % style,
        '',
        '<!-- VDP data block (pattern B phase 3, 2026-10-24): vdp_json from vdp_render.py, read by vdp.js + lead-form.js. Empty on cars without one. -->',
        '<script type="application/json" id="bst-vdp-data">%s</script>' % wf('vdp-json'),
    ])
    out = ROOT / 'dist/vdp-head.html'
    out.parent.mkdir(exist_ok=True)
    out.write_text(head)
    print('css %d -> %d chars; head block %d chars (limit %d)' % (len(css), len(style), len(head), LIMIT))
    if len(head) > LIMIT:
        sys.exit('over the Webflow custom-code limit')

if __name__ == '__main__':
    build()
