import { isSameDay } from "../utils/dateHelpers";

/**
 * Data shape:
 *   slot = { id, time, jobs: [job] }
 *   job  = { id, title, property, room, assignee, status, priority?, note? }
 */

/* ── Week mock data ── */
export function buildWeekEvents(weekDays) {
  const today    = new Date();
  const todayIdx = weekDays.findIndex((d) => isSameDay(d, today));
  const events   = Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, []]));
  if (todayIdx < 0) return events;

  if (todayIdx - 2 >= 0)
    events[todayIdx - 2] = [
      { id: "s1", time: "08:30", jobs: [
        { id: "j1", title: "Sửa máy bơm tầng B2",    property: "Block A",    room: "Tầng hầm B2",    assignee: "Nguyễn Văn A", status: "done" },
        { id: "j2", title: "Vệ sinh bộ lọc nước",     property: "Khu C – Lô 3", room: "Phòng kỹ thuật", assignee: "Trần Hùng",    status: "done" },
      ]},
      { id: "s2", time: "14:00", jobs: [
        { id: "j3", title: "Bảo trì hệ thống điện",   property: "Block C",    room: "Tủ điện tầng 3", assignee: "Lê Văn Tâm",   status: "done" },
      ]},
    ];

  if (todayIdx - 1 >= 0)
    events[todayIdx - 1] = [
      { id: "s3", time: "10:00", jobs: [
        { id: "j4", title: "Kiểm tra thiết bị IoT",   property: "Block B",       room: "Gateway tầng 5",   assignee: "Trần Hùng",    status: "done" },
        { id: "j5", title: "Kiểm tra camera an ninh",  property: "Khu D",         room: "Hành lang tầng 2", assignee: "Phạm Quốc H",  status: "done" },
        { id: "j6", title: "Bảo dưỡng khóa điện tử",  property: "Khu E – P.101", room: "Cửa chính",        assignee: "Ngô Bảo Châu", status: "done" },
      ]},
    ];

  events[todayIdx] = [
    { id: "s4", time: "09:15", jobs: [
      { id: "j7", title: "Thay sensor độ ẩm S3-B1",          property: "Block A", room: "Phòng 301", assignee: "Ngô Bảo Châu", status: "inProgress" },
      { id: "j8", title: "Cài đặt sensor nhiệt độ",          property: "Block B", room: "Phòng 205", assignee: "Lê Văn Tâm",   status: "inProgress" },
    ]},
    { id: "s5", time: "13:30", jobs: [
      { id: "j9", title: "Xử lý nhiễu tín hiệu Gateway",     property: "Khu C",          room: "Trạm Gateway C3",   assignee: null, status: "pending", priority: "high",
        note: "Tín hiệu bị nhiễu nghiêm trọng, cần kiểm tra lại cáp kết nối và cấu hình tần số." },
    ]},
    { id: "s6", time: "15:00", jobs: [
      { id: "j10", title: "Lắp đặt IOT Node mới",            property: "Block A",        room: "Hành lang tầng 4", assignee: "Nguyễn Văn A", status: "pending" },
      { id: "j11", title: "Cấu hình MQTT broker",            property: "Phòng máy chủ", room: "Server Room",       assignee: null,           status: "pending" },
    ]},
  ];

  if (todayIdx + 1 < 7)
    events[todayIdx + 1] = [
      { id: "s7", time: "08:00", jobs: [
        { id: "j12", title: "Kiểm định thiết bị đo định kỳ", property: "Block A", room: "Toàn bộ tầng 1",    assignee: null, status: "upcoming" },
        { id: "j13", title: "Bảo trì đồng hồ điện nước",    property: "Block B", room: "Phòng kỹ thuật B1", assignee: null, status: "upcoming" },
      ]},
    ];

  return events;
}

/* ── Month mock data ── */
export function buildMonthEvents(year, month) {
  const map   = {};
  const base  = new Date().getDate();
  const daysInM = new Date(year, month + 1, 0).getDate();

  const seed = [
    { day: 2,  slots: [{ id: "ms1",  time: "09:00", jobs: [
      { id: "mj1",  title: "Bảo trì định kỳ Block A",          property: "Block A", room: "Toàn bộ tòa",        assignee: "Nguyễn Văn A", status: "done" },
      { id: "mj2",  title: "Vệ sinh hệ thống thông gió",       property: "Block B", room: "Mái tầng 10",        assignee: "Trần Hùng",    status: "done" },
    ]}]},
    { day: 5,  slots: [
      { id: "ms2",  time: "14:00", jobs: [
        { id: "mj3",  title: "Kiểm tra hệ thống PCCC",         property: "Block A", room: "Tất cả tầng",        assignee: "Trần Hùng",    status: "done" },
        { id: "mj4",  title: "Kiểm tra bình cứu hỏa",          property: "Block B", room: "Hành lang",          assignee: "Lê Văn Tâm",   status: "done" },
      ]},
      { id: "ms3",  time: "16:00", jobs: [
        { id: "mj5",  title: "Vệ sinh bể nước tầng mái",       property: "Block C", room: "Bể nước mái",        assignee: "Lê Văn Tâm",   status: "done" },
      ]},
    ]},
    { day: 8,  slots: [{ id: "ms4",  time: "08:30", jobs: [
      { id: "mj6",  title: "Sửa thang máy số 2",               property: "Block A", room: "Thang máy T2",       assignee: "Phạm Quốc H",  status: "done" },
      { id: "mj7",  title: "Kiểm tra cáp thang máy số 3",      property: "Block B", room: "Thang máy T3",       assignee: "Ngô Bảo Châu", status: "done" },
    ]}]},
    { day: 10, slots: [
      { id: "ms5",  time: "09:15", jobs: [
        { id: "mj8",  title: "Thay sensor độ ẩm S3-B1",        property: "Block A", room: "Phòng 301",          assignee: "Ngô Bảo Châu", status: "inProgress" },
        { id: "mj9",  title: "Cài đặt sensor nhiệt độ",        property: "Block B", room: "Phòng 205",          assignee: "Lê Văn Tâm",   status: "inProgress" },
      ]},
      { id: "ms6",  time: "13:30", jobs: [
        { id: "mj10", title: "Xử lý nhiễu tín hiệu Gateway",   property: "Khu C",   room: "Trạm Gateway C3",    assignee: null, status: "pending", priority: "high" },
      ]},
      { id: "ms7",  time: "15:00", jobs: [
        { id: "mj11", title: "Lắp đặt IOT Node mới",           property: "Block A",        room: "Hành lang tầng 4", assignee: "Nguyễn Văn A", status: "pending" },
        { id: "mj12", title: "Cấu hình MQTT broker",           property: "Phòng máy chủ", room: "Server Room",       assignee: null,           status: "pending" },
      ]},
    ]},
    { day: 12, slots: [{ id: "ms8",  time: "08:00", jobs: [
      { id: "mj13", title: "Kiểm định thiết bị đo định kỳ",    property: "Block A", room: "Toàn bộ tầng 1",    assignee: null, status: "upcoming" },
      { id: "mj14", title: "Bảo trì đồng hồ điện nước",       property: "Block B", room: "Phòng kỹ thuật B1", assignee: null, status: "upcoming" },
    ]}]},
    { day: 15, slots: [{ id: "ms9",  time: "10:00", jobs: [
      { id: "mj15", title: "Bảo trì máy phát điện dự phòng",  property: "Block A", room: "Phòng máy phát",    assignee: "Lê Văn Tâm",  status: "upcoming" },
      { id: "mj16", title: "Kiểm tra ATS tự động",            property: "Block B", room: "Tủ điện chính",     assignee: "Trần Hùng",   status: "upcoming" },
    ]}]},
    { day: 18, slots: [{ id: "ms10", time: "09:00", jobs: [
      { id: "mj17", title: "Vệ sinh hệ thống điều hoà",       property: "Block A", room: "Phòng 201–210",     assignee: null, status: "pending" },
      { id: "mj18", title: "Nạp gas điều hoà",                property: "Block B", room: "Phòng 301–305",     assignee: null, status: "pending" },
    ]}]},
    { day: 20, slots: [{ id: "ms11", time: "14:00", jobs: [
      { id: "mj19", title: "Kiểm tra hệ thống báo cháy",      property: "Block A",    room: "Tất cả tầng", assignee: "Nguyễn Văn A", status: "upcoming" },
      { id: "mj20", title: "Test còi báo động khẩn cấp",      property: "Block B",    room: "Tất cả tầng", assignee: "Phạm Quốc H",  status: "upcoming" },
      { id: "mj21", title: "Kiểm tra đèn thoát hiểm",         property: "Khu nhà C", room: "Hành lang",   assignee: "Trần Hùng",    status: "upcoming" },
    ]}]},
    { day: 22, slots: [{ id: "ms12", time: "08:30", jobs: [
      { id: "mj22", title: "Bảo dưỡng bơm nước tầng hầm",    property: "Block A", room: "Tầng hầm",      assignee: "Nguyễn Văn A", status: "upcoming" },
    ]}]},
    { day: 25, slots: [{ id: "ms13", time: "11:00", jobs: [
      { id: "mj23", title: "Nâng cấp firmware Gateway",       property: "Khu C",        room: "Trạm Gateway",  assignee: "Phạm Quốc H",  status: "upcoming" },
      { id: "mj24", title: "Cập nhật firmware sensor",        property: "Block A và B", room: "Tất cả tầng",   assignee: "Ngô Bảo Châu", status: "upcoming" },
    ]}]},
    { day: 28, slots: [{ id: "ms14", time: "09:00", jobs: [
      { id: "mj25", title: "Kiểm tra tổng hệ thống IoT",      property: "Toàn khu",      room: "Tất cả khu vực", assignee: "Trần Hùng",   status: "upcoming" },
      { id: "mj26", title: "Báo cáo tình trạng thiết bị",     property: "Phòng quản lý", room: "Văn phòng",      assignee: "Lê Văn Tâm",  status: "upcoming" },
    ]}]},
  ];

  seed.forEach((entry) => {
    const adjustedDay = Math.min(daysInM, Math.max(1, base + entry.day - 10));
    const key = `${year}-${month}-${adjustedDay}`;
    if (!map[key]) map[key] = [];
    map[key].push(...entry.slots);
  });

  return map;
}
