import re, pathlib
root = pathlib.Path(r'C:\Users\hp\Music\Cpmpany portfolio')
css = (root/'app/globals.css').read_text(encoding='utf-8')
css_names = set()
for m in re.finditer(r'([^{]+)\{', css):
    selectors = m.group(1).split(',')
    for sel in selectors:
        clean = sel.strip()
        css_names.update(re.findall(r'\.([A-Za-z0-9_-]+)', clean))
        id_match = re.search(r'#([A-Za-z0-9_-]+)', clean)
        if id_match:
            css_names.add(id_match.group(1))
used = set()
for p in (root/'app').rglob('*'):
    if p.suffix.lower() in {'.ts','.tsx','.js','.jsx'}:
        txt = p.read_text(encoding='utf-8', errors='ignore')
        for match in re.finditer(r'className\s*=\s*(?:"([^"]+)"|\'([^\']+)\'|\{`([^`]*)`\}|\{\s*"([^"]+)"\s*\}|\{\s*\'([^\']+)\'\s*\})', txt):
            for group in match.groups():
                if not group:
                    continue
                used.update(re.findall(r'[A-Za-z0-9_-]+', group))
keep = {
    'wrap','btn','solid','ghost','primary','secondary','active','hidden','open','page','hero','lead','main','section','header','nav','container','card','row','col','title','text','link','image','button','chip','tag','status','content','grid','meta','label','input','form','modal','overlay','menu','toggle','badge','cta','detail','profile','shell','page-hero','eyebrow','h-display','logo','brand','auth','dashboard','faq','join','membership','team','work','service','project','insight','value','testimonial','contact','book','stack','debug','scroll','reveal','loading','featured','muted','feature','about','service-card','overview-card','feature-shell','feature-copy','feature-panel','capability-banner','work-grid','work-card','team-card','value-card','testimonial-card','contact-form','contact-detail-row','detail-label','overview-grid'
}
unused = sorted(n for n in css_names if n not in used and n not in keep)
print(f'total CSS classes={len(css_names)}')
print(f'used tokens={len(used)}')
print(f'unused count={len(unused)}')
print('\n'.join(unused[:250]))
