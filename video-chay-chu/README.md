# video-chay-chu — dựng video short WheyShop bằng Remotion

Skill hướng dẫn: `../.claude/skills/video-chay-chu/` (SKILL.md, BRIEF-SENIOR-EDITOR.md, HUONG-DAN-LUU-Y.md, sfx/).
Mọi lệnh trong skill chạy từ thư mục này (`video-chay-chu/`).

## Chuẩn bị
```bash
scripts/setup.sh          # Node + Remotion + kiểm tra font
scripts/setup.sh --py     # thêm venv Python (giọng đọc, mốc từ, tách nền) — nặng
```

## Dựng video mới
1. Copy video nguồn vào `public/` (không commit file .mp4 nguồn nặng nếu > 100 MB).
2. `scripts/pipeline.sh public/<raw>.mp4 [script.txt] work/<ten>` → cut.mp4, normalized.mp4, words.json.
3. Tạo props `props/<ten>.json` (xem `scripts/kb13_props.py` làm mẫu), chọn composition trong `src/Root.tsx`.
4. `python3 scripts/kiem_chu.py <Composition> props/<ten>.json` → phải "Tổng lỗi: 0".
5. `npx remotion render src/index.ts <Composition> out/<ten>-ketqua.mp4 --props=props/<ten>.json`
6. Bàn giao MP4 + `out/<ten>-timeline.md`.

## Thành phần
- Composition: ChayChu, TalkSub, TalkKinetic, ShortEdit (KB2), VersusEdit (KB12), StoryEdit (KB13), InfoStyles/InfoCreatine/GroupStyles (ảnh tĩnh).
- Chưa có trong repo: video nguồn của các bản KB/KB2/KB12/KB13 → các composition đó chưa render lại được cho đến khi chép nguồn vào `public/`.
