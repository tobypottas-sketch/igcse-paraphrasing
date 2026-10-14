from pathlib import Path
p=Path('index.html')
s=p.read_text()
needle='"the helpers were committed to making the place better", "the helpers were committed to making the place better"'
replacement='"the helpers were committed to making the place better", "the group showed determination to improve the neighbourhood"'
if needle not in s:
    raise SystemExit('duplicate model pair not found')
p.write_text(s.replace(needle,replacement,1))
