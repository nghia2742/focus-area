# SPEC: Pomodoro có chu kỳ (Pomodoro Cycles)

> Tài liệu giao cho coding agent. Độc lập với các spec khác. Mọi quyết định bên dưới là cuối cùng, không cần hỏi lại.

---

## 0. Tài liệu tham chiếu (đọc trước khi làm)

**Đọc `features-summary.md` trước**, đặt cùng thư mục với file spec này. Đó là nguồn sự thật về các tính năng hiện có của app.

- Ký hiệu `#N` trong spec này là **số thứ tự dòng** trong bảng của `features-summary.md`. Ví dụ `#5` là Timer, `#18` là Session Save and Restore.
- Không đánh số lại các dòng của `features-summary.md`. Dòng mới luôn thêm vào cuối bảng.
- Các dòng liên quan trực tiếp đến spec này:

| `#` | Feature | Liên quan |
| --- | --- | --- |
| 3 | Session Setup | Thêm cấu hình Pomodoro vào bottom sheet |
| 4 | Session Modes | Thêm chế độ thứ 3 |
| 5 | Timer | Nhãn pha, chấm vòng, nút Skip |
| 6, 7 | Pause and Resume, End Confirmation | Dùng lại, không đổi hành vi |
| 9 | Notifications | Thông báo mỗi lần chuyển pha |
| 10, 11, 12 | History, Statistics, Chart | Ghi bản ghi mới, công thức giữ nguyên |
| 14 | Default Session Settings | Mặc định cho Pomodoro |
| 17 | Shortcuts | Thêm `N` và `Enter` |
| 18, 19 | Session Save and Restore, Persistence | Lưu và khôi phục trạng thái Pomodoro |
| 20 | Quality and Platform | Giữ no-scroll, a11y, reduced motion |

- Sau khi hoàn thành spec, **cập nhật `features-summary.md`** theo mục 13.

---

## 1. Mục tiêu

Thêm chế độ phiên thứ 3 **Pomodoro** bên cạnh **Open Focus** và **Target Focus**. Một phiên Pomodoro gồm nhiều vòng: `focus → nghỉ ngắn → focus → ... → nghỉ dài`, tự chuyển pha, kết thúc sau số vòng cố định.

## 2. Phạm vi

### In scope
- Chế độ `pomodoro` trong Thiết lập phiên (#3), Chế độ phiên (#4) và Cài đặt phiên mặc định (#14).
- Máy trạng thái 3 pha: `focus`, `shortBreak`, `longBreak`.
- Chỉ báo vòng (round dots) và nhãn pha trên Bộ đếm thời gian (#5).
- Thông báo trình duyệt mỗi lần chuyển pha (tái sử dụng Thông báo, #9).
- Pause/Resume, Skip pha, End Session hoạt động trong Pomodoro.
- Khôi phục phiên khi tải lại trang (#18).
- Lưu 1 bản ghi History cho mỗi phiên Pomodoro, chỉ tính thời gian **focus**.
- Phím tắt `N` để Skip pha.
- Cập nhật `document.title`.

### Out of scope (không làm trong spec này)
- Âm chuông kết thúc pha (thuộc spec riêng).
- Overtime trong Pomodoro (không hỗ trợ).
- Gắn tag cho phiên, streak, mục tiêu ngày.
- Thống kê riêng theo pha hoặc theo vòng.
- Đồng bộ đa thiết bị.
- Thay đổi hành vi của Open Focus và Target Focus.

---

## 3. Giá trị mặc định và giới hạn

| Tham số | Key | Mặc định | Min | Max | Đơn vị |
| --- | --- | --- | --- | --- | --- |
| Thời lượng focus | `focusMin` | 25 | 1 | 120 | phút |
| Nghỉ ngắn | `shortBreakMin` | 5 | 1 | 30 | phút |
| Nghỉ dài | `longBreakMin` | 15 | 1 | 60 | phút |
| Số vòng focus trước mỗi lần nghỉ dài | `roundsPerLongBreak` | 4 | 2 | 8 | vòng |
| Tổng số vòng focus của phiên | `totalRounds` | 4 | 1 | 12 | vòng |
| Tự chạy nghỉ | `autoStartBreak` | `true` | - | - | bool |
| Tự chạy focus kế tiếp | `autoStartFocus` | `false` | - | - | bool |

Preset nhanh trong UI (chip): **25/5/15** (mặc định), **50/10/30**, **90/15/30**.

Giá trị nhập ngoài giới hạn được **clamp** về min/max, không báo lỗi.

---

## 4. Cấu trúc file

```
src/features/pomodoro/
├── types.ts            // kiểu dữ liệu
├── config.ts           // DEFAULTS, LIMITS, PRESETS, clamp
├── machine.ts          // hàm thuần: bắt đầu, chuyển pha, pause, skip, restore
├── machine.test.ts     // unit test cho machine.ts
├── usePomodoro.ts      // hook: tick, persist, notification, title
├── PomodoroSettings.tsx// form cấu hình (dùng trong bottom sheet và Settings)
└── RoundDots.tsx       // chỉ báo vòng
```

Quy tắc: `machine.ts` **không** import React, không gọi `Date.now()` trực tiếp. Mọi hàm nhận `now: number` làm tham số để test được.

---

## 5. Kiểu dữ liệu

```ts
// types.ts
export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';
export type PomodoroStatus = 'running' | 'paused' | 'awaiting' | 'done';

export interface PomodoroConfig {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  roundsPerLongBreak: number;
  totalRounds: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
}

export interface PomodoroState {
  phase: PomodoroPhase;
  round: number;            // 1-based, vòng focus hiện tại
  status: PomodoroStatus;
  endsAt: number | null;    // epoch ms, chỉ khi status === 'running'
  remainingMs: number;      // luôn được cập nhật khi paused/awaiting
  focusMsDone: number;      // tổng ms focus đã được ghi nhận
  roundsCompleted: number;  // số pha focus chạy đủ 100% thời lượng
  startedAt: number;        // epoch ms lúc bắt đầu phiên
  config: PomodoroConfig;   // snapshot lúc bắt đầu, không đổi trong phiên
  task: string;
}
```

Ý nghĩa `awaiting`: pha vừa kết thúc, chờ người dùng bấm bắt đầu pha kế (khi auto-start tắt, hoặc sau khi khôi phục phiên).

---

## 6. Quy tắc máy trạng thái

### 6.1 Thời lượng pha

```ts
export const phaseMs = (phase: PomodoroPhase, c: PomodoroConfig) =>
  (phase === 'focus' ? c.focusMin
    : phase === 'shortBreak' ? c.shortBreakMin
    : c.longBreakMin) * 60_000;
```

### 6.2 Pha kế tiếp

```ts
export function nextPhase(
  phase: PomodoroPhase, round: number, c: PomodoroConfig
): { phase: PomodoroPhase; round: number } | 'done' {
  if (phase === 'focus') {
    if (round >= c.totalRounds) return 'done';
    return round % c.roundsPerLongBreak === 0
      ? { phase: 'longBreak', round }
      : { phase: 'shortBreak', round };
  }
  return { phase: 'focus', round: round + 1 };
}
```

Hệ quả: **không có nghỉ sau vòng focus cuối cùng**; phiên kết thúc ngay.

### 6.3 Ghi nhận thời gian focus

Chỉ cộng vào `focusMsDone` khi **rời** một pha focus (hoàn thành, skip, hoặc End Session):

```ts
const remaining = (s: PomodoroState, now: number) =>
  s.status === 'running' ? Math.max(0, s.endsAt! - now) : s.remainingMs;

const focusCredit = (s: PomodoroState, now: number) =>
  s.phase === 'focus' ? phaseMs('focus', s.config) - remaining(s, now) : 0;
```

`roundsCompleted` chỉ tăng +1 khi pha focus chạy hết (`remaining === 0`). Skip giữa chừng vẫn cộng thời gian đã chạy nhưng **không** tăng `roundsCompleted`.

### 6.4 Bảng chuyển trạng thái

| Hành động | Điều kiện | Kết quả |
| --- | --- | --- |
| `start` | - | `phase=focus, round=1, status=running`, `endsAt = now + focusMs` |
| `pause` | `running` | `status=paused`, `remainingMs = endsAt - now`, `endsAt=null` |
| `resume` | `paused` | `status=running`, `endsAt = now + remainingMs` |
| `complete` (tick chạm 0) | `running` | Cộng credit, chuyển pha kế; nếu pha kế `done` → `status=done`; nếu auto-start của pha kế bật → `running`, ngược lại → `awaiting` |
| `skip` | `running` hoặc `paused` | Như `complete` nhưng credit theo thời gian thực đã chạy, bỏ qua tăng `roundsCompleted` |
| `startNext` | `awaiting` | `status=running`, `endsAt = now + phaseMs` |
| `end` | bất kỳ | Cộng credit pha hiện tại, `status=done` |

Auto-start áp dụng theo **pha đích**: đích là `shortBreak`/`longBreak` dùng `autoStartBreak`, đích là `focus` dùng `autoStartFocus`.

### 6.5 Khôi phục khi tải lại trang

```ts
export function restore(s: PomodoroState, now: number): PomodoroState {
  if (s.status !== 'running' || now < s.endsAt!) return s; // paused/awaiting/chưa hết giờ: giữ nguyên
  // Pha đã hết trong lúc vắng mặt: hoàn thành đúng 1 pha rồi DỪNG ở awaiting.
  const done = complete({ ...s, endsAt: s.endsAt }, s.endsAt!, /* forceAwaiting */ true);
  return done;
}
```

Quy tắc cố định:
- Chỉ xử lý **một** pha đã hết, không mô phỏng chuỗi nhiều pha.
- Luôn dừng ở `awaiting`, **không** tự chạy pha kế dù auto-start bật.
- Không gửi thông báo trình duyệt khi khôi phục.
- Nếu pha vừa hết là vòng focus cuối, `status=done` và hiển thị hộp thoại lưu kết quả (xem mục 8).

---

## 7. Hook `usePomodoro`

Yêu cầu:
- Tick bằng `setInterval(..., 250)`; mỗi tick chỉ tính `remaining = endsAt - Date.now()`, **không** đếm lùi theo số tick (chống lệch khi tab bị throttle).
- Khi `remaining <= 0` gọi `complete` đúng một lần (guard bằng ref).
- Lắng nghe `visibilitychange`: khi tab hiện lại, chạy một tick ngay lập tức.
- Persist toàn bộ `PomodoroState` vào storage mỗi khi state đổi (debounce 0, ghi đồng bộ).
- Gọi thông báo ở mỗi lần `complete`/`skip` chuyển sang pha mới (trừ khi đang khôi phục).
- Cập nhật `document.title`.

```ts
// Định dạng title
// running:  "24:59 · Focus 2/4"
// break:    "04:30 · Nghỉ ngắn"
// paused:   "⏸ 24:59 · Focus 2/4"
// awaiting: "Sẵn sàng · Nghỉ ngắn"
// done:     "Hoàn thành"
```

Trả về từ hook: `{ state, remainingMs, progress, start, pause, resume, skip, startNext, end }`, trong đó `progress = 1 - remainingMs / phaseMs(phase)`.

---

## 8. UI

### 8.1 Thiết lập phiên (bottom sheet, #3, #4)
- Đổi bộ chọn chế độ thành **3 segment**: `Open` | `Target` | `Pomodoro`.
- Khi chọn `Pomodoro`, ẩn bộ chọn thời lượng của Open/Target và hiện `PomodoroSettings` với:
  - Hàng chip preset (25/5/15, 50/10/30, 90/15/30).
  - 5 ô số: `focusMin`, `shortBreakMin`, `longBreakMin`, `roundsPerLongBreak`, `totalRounds`.
  - 2 công tắc: `Tự chạy nghỉ`, `Tự chạy focus kế tiếp`.
- Dòng tóm tắt dưới form, ví dụ: `4 vòng · tổng focus 100 phút` (`totalRounds * focusMin`).
- **Tuân thủ Adaptive No-Scroll Layout**: bottom sheet dùng vùng co giãn, trên màn hình thấp các ô số xếp 2 cột thay vì cuộn.

### 8.2 Bộ đếm thời gian (#5)
- Trên đồng hồ: nhãn pha, văn bản `Focus`, `Nghỉ ngắn`, hoặc `Nghỉ dài`.
- Dưới đồng hồ: `RoundDots` gồm `totalRounds` chấm (tối đa hiển thị 12).
  - Chấm đầy: vòng đã hoàn thành (`i < roundsCompleted`).
  - Chấm viền nhấp nháy nhẹ: vòng hiện tại khi đang `focus`.
  - Chấm rỗng: vòng chưa tới.
- Pha nghỉ đổi sang tông màu phụ (dùng biến CSS `--accent-break`, định nghĩa cạnh `--accent`), chuyển bằng transition 400ms.
- Khi `status=awaiting`: hiện nút chính `Bắt đầu nghỉ` hoặc `Bắt đầu focus` và nút phụ `Kết thúc`.
- Nút phụ mới `Skip` (icon `SkipForward` của Lucide), không hiện khi `awaiting`.
- Skip một pha focus **không cần xác nhận**; End Session vẫn giữ hộp thoại xác nhận hiện tại (#7).

### 8.3 Hộp thoại kết thúc
Khi `status=done`:
- Tiêu đề: `Hoàn thành {roundsCompleted}/{totalRounds} vòng`.
- Dòng phụ: `Tổng thời gian focus: {formatDuration(focusMsDone)}`.
- Một nút `Xong`; bản ghi History đã được lưu tự động trước khi hộp thoại mở.

### 8.4 Phím tắt
| Phím | Hành động | Điều kiện |
| --- | --- | --- |
| `Space` | Pause / Resume (có sẵn, #6, #17) | `running` hoặc `paused` |
| `N` | Skip pha | `running` hoặc `paused` |
| `Enter` | `startNext` | `awaiting` |

Bỏ qua phím tắt khi focus đang ở `input`, `textarea`, hoặc phần tử `contenteditable`.

### 8.5 Thông báo trình duyệt
| Chuyển sang | Tiêu đề | Nội dung |
| --- | --- | --- |
| `shortBreak` | `Nghỉ ngắn` | `Bạn đã xong vòng {round}/{totalRounds}. Nghỉ {shortBreakMin} phút.` |
| `longBreak` | `Nghỉ dài` | `Bạn đã xong vòng {round}/{totalRounds}. Nghỉ {longBreakMin} phút.` |
| `focus` | `Quay lại tập trung` | `Vòng {round}/{totalRounds} bắt đầu.` |
| `done` | Dùng lời nhắn tùy chỉnh hoặc mặc định của Thông báo (#9) | - |

### 8.6 Accessibility
- Vùng hiển thị pha và vòng có `aria-live="polite"`; chỉ đọc khi pha **đổi**, không đọc mỗi giây.
- Mỗi chấm trong `RoundDots` có `aria-label`, ví dụ `Vòng 2, đang diễn ra`.
- Tôn trọng `prefers-reduced-motion`: tắt nhấp nháy chấm và transition màu, đổi tức thì.

---

## 9. Lưu trữ và History

### 9.1 Storage
- Key mới: `focus:pomodoro:config` (cấu hình mặc định người dùng đã chọn trong Settings).
- Key phiên đang chạy: dùng key phiên hiện có của Lưu và khôi phục phiên (#18) và thêm trường `mode: 'pomodoro'` kèm `pomodoro: PomodoroState`.
- Mọi thay đổi shape dữ liệu tăng `schemaVersion` lên **+1**; dữ liệu cũ thiếu `mode` được hiểu là `open` hoặc `target` như hiện tại, **không** migrate lại.

### 9.2 Bản ghi History

```ts
interface PomodoroHistoryRecord {
  id: string;
  mode: 'pomodoro';
  task: string;
  startedAt: number;
  endedAt: number;
  durationSec: number;      // Math.round(focusMsDone / 1000)
  roundsCompleted: number;
  roundsPlanned: number;    // config.totalRounds
}
```

Quy tắc:
- Lưu khi `status` chuyển sang `done` và `durationSec >= 60`; dưới 60 giây thì **không lưu**.
- `durationSec` **chỉ gồm focus**, nên Thống kê (#11) và Biểu đồ (#12) tự đúng mà không sửa công thức.
- Lịch sử tập trung (#10): thêm một dòng vào chi tiết phiên `Pomodoro · {roundsCompleted}/{roundsPlanned} vòng`.

---

## 10. Các bước triển khai (theo thứ tự)

| # | Bước | Kết quả kiểm chứng |
| --- | --- | --- |
| 1 | Tạo `types.ts`, `config.ts` (DEFAULTS, LIMITS, PRESETS, `clamp`) | Biên dịch qua |
| 2 | Viết `machine.ts` và `machine.test.ts` (mục 11) | Toàn bộ test xanh |
| 3 | Viết `usePomodoro.ts` (tick, persist, title, thông báo) | Chạy được trong một trang test |
| 4 | Viết `RoundDots.tsx` và `PomodoroSettings.tsx` | Hiển thị đúng ở 3 breakpoint |
| 5 | Nối segment `Pomodoro` vào bottom sheet thiết lập | Bắt đầu được phiên Pomodoro |
| 6 | Cập nhật Focus Timer: nhãn pha, dots, nút Skip, trạng thái `awaiting` | Chuyển pha đúng bằng mắt |
| 7 | Thêm phím tắt `N` và `Enter` (#17) | Hoạt động, không xung đột F/S/H/Z |
| 8 | Nối khôi phục phiên (#18) và lưu History (#10, #19) | Reload giữa phiên đúng như mục 6.5 |
| 9 | Thêm tùy chọn mặc định vào Cài đặt phiên mặc định (#14) | Mặc định áp dụng cho phiên mới |
| 10 | Rà a11y, reduced motion, no-scroll trên 360×640 | Qua checklist mục 12 |

---

## 11. Unit test bắt buộc cho `machine.ts`

1. Với `totalRounds=4, roundsPerLongBreak=4`: chuỗi pha là `F1 S F2 S F3 S F4 → done` (không có nghỉ dài, vì vòng 4 là vòng cuối).
2. Với `totalRounds=8, roundsPerLongBreak=4`: sau F4 là `longBreak`, sau F8 là `done`.
3. Với `totalRounds=1`: hoàn thành F1 thì `done`, không có nghỉ.
4. `pause` sau 10 phút của focus 25 phút: `remainingMs = 15 * 60_000`; `resume` đặt lại `endsAt` đúng.
5. `skip` focus ở phút thứ 10: `focusMsDone += 10 * 60_000`, `roundsCompleted` không đổi.
6. `complete` focus đủ giờ: `focusMsDone += 25 * 60_000`, `roundsCompleted += 1`.
7. Pha nghỉ không bao giờ cộng vào `focusMsDone`.
8. Auto-start: `autoStartBreak=false` thì sau focus ở `awaiting`; `autoStartFocus=true` thì sau nghỉ ở `running`.
9. `restore` khi pha đã hết 2 giờ trước: xử lý đúng 1 pha, `status=awaiting`, không chạy pha kế.
10. `end` giữa pha nghỉ: không cộng thêm focus, `status=done`.
11. `clamp`: `focusMin=0 → 1`, `focusMin=500 → 120`, `totalRounds=20 → 12`.

---

## 12. Tiêu chí nghiệm thu

- [ ] Phiên 25/5/15 × 4 vòng chạy đúng thứ tự pha và thời gian (kiểm tra nhanh bằng hằng số debug `TIME_SCALE=60`, **xóa** trước khi merge).
- [ ] Đóng tab 1 phút giữa pha focus, mở lại: đồng hồ vẫn đúng, không lệch quá 1 giây.
- [ ] Tab nền 5 phút: pha vẫn chuyển đúng giờ và nhận được thông báo.
- [ ] Reload khi `paused`: vẫn `paused` với đúng `remainingMs`.
- [ ] Reload khi pha đã hết: hiện trạng thái `awaiting`, không tự chạy.
- [ ] History của phiên Pomodoro chỉ chứa thời gian focus.
- [ ] Open Focus và Target Focus hoạt động y như trước (kiểm tra hồi quy thủ công).
- [ ] Không xuất hiện thanh cuộn ở màn hình chính tại 360×640, 768×1024, 1440×900.
- [ ] Mọi phím tắt (hotkey) không kích hoạt khi đang gõ trong ô nhập.
- [ ] Không có lỗi hoặc cảnh báo mới trong console.

---

## 13. Cập nhật `features-summary.md` sau khi hoàn thành

Chỉ sửa nội dung các ô **Function** của 6 dòng dưới đây. Không thêm dòng mới, không đổi số thứ tự, không sửa dòng khác.

| `#` | Feature | Function mới (giữ nguyên tiếng Anh) |
| --- | --- | --- |
| 4 | Session Modes | Three options: Open (counts up), Target (counts down from a goal duration), and Pomodoro (cycles of focus and break phases that switch automatically). |
| 5 | Timer | Shows focus time; in Target mode, keeps showing time past the goal when the user wants to focus longer; in Pomodoro mode, shows the current phase and round progress. |
| 9 | Notifications | Sends a notification when a Target session reaches its goal, with a custom or default message; in Pomodoro mode, also notifies on each phase change; lets users preview the notification. |
| 10 | Focus History | Lists completed sessions with task, mode, time, and duration; Pomodoro sessions record focused time only and completed rounds. |
| 14 | Default Session Settings | Choose the default mode and duration for new sessions, including Pomodoro focus, break, and round settings. |
| 17 | Shortcuts | F opens Session Setup, S opens Settings, H opens History, Z toggles Zen Mode; Space pauses and resumes the session; N skips the current Pomodoro phase. |