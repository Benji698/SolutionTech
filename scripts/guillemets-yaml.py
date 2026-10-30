import re,sys
def q(v):
    return '"' + v.replace('\\','\\\\').replace('"','\\"') + '"'
for p in sys.argv[1:]:
    out=[];block=None;n=0
    for line in open(p).read().split('\n'):
        ind=len(line)-len(line.lstrip())
        if block is not None:
            if line.strip()=='' or ind>block: out.append(line);continue
            block=None
        m=re.match(r'^(\s*(?:- )?[a-z_]+: )(.*)$',line) or re.match(r'^(\s*- )(.*)$',line)
        if m:
            pre,val=m.groups()
            if val in('|','>','|-','>-'): block=ind; out.append(line); continue
            if val and val[0] not in '"\'[{|>' and ': ' in val:
                line=pre+q(val); n+=1
        out.append(line)
    open(p,'w').write('\n'.join(out)); print(p,n)
