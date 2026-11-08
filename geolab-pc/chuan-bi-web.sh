#!/bin/bash
# Lấy nội dung GeoLab mới nhất (kho hinh-hoc-tuong-tac) vào geolab-pc/web để đóng gói kèm app.
# Ghi .ds.json (danh sách tệp + mã git của từng tệp) để app sau này chỉ tải các tệp đã đổi.
set -e
cd "$(dirname "$0")"
rm -rf web nguon && git clone --depth 1 https://github.com/tthuu-pixel/hinh-hoc-tuong-tac.git nguon
mkdir web
(cd nguon && git -c core.quotepath=false ls-tree -r HEAD) | while read -r che loai sha duong; do
  case "$duong" in .*|*/.*|CNAME) continue;; esac
  mkdir -p "web/$(dirname "$duong")"; cp "nguon/$duong" "web/$duong"
done
node -e "
const cp=require('child_process'),fs=require('fs');
const ds={};cp.execSync('git -c core.quotepath=false -C nguon ls-tree -r HEAD').toString().trim().split('\n').forEach(d=>{const m=d.match(/^\S+ blob (\S+)\t(.+)$/);if(m&&!/(^|\/)\./.test(m[2])&&m[2]!=='CNAME')ds[m[2]]=m[1];});
const sha=cp.execSync('git -C nguon rev-parse HEAD').toString().trim(), luc=Date.parse(cp.execSync('git -C nguon log -1 --format=%cI').toString().trim());
fs.writeFileSync('web/.ds.json',JSON.stringify(ds));fs.writeFileSync('web/.phien-ban.json',JSON.stringify({sha,luc}));
console.log('Đã chép',Object.keys(ds).length,'tệp GeoLab, bản',sha.slice(0,7));"
rm -rf nguon
