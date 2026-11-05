export const formatDateKey = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getSundayOfWeek = (date = new Date()) => {
  const monday = getMondayOfWeek(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

export const getWeekId = (date = new Date()) => {
  const monday = getMondayOfWeek(date);
  const sunday = getSundayOfWeek(date);
  return `${formatDateKey(monday)}_to_${formatDateKey(sunday)}`;
};

export const getWeekLabel = (date = new Date()) => {
  const monday = getMondayOfWeek(date);
  const sunday = getSundayOfWeek(date);

  const startMonth = monday.toLocaleDateString("en-US", { month: "short" });
  const startDay = String(monday.getDate()).padStart(2, "0");
  const endMonth = sunday.toLocaleDateString("en-US", { month: "short" });
  const endDay = String(sunday.getDate()).padStart(2, "0");
  const year = sunday.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
};

export const isCurrentWeek = (date = new Date()) => {
  const todayWeekId = getWeekId(new Date());
  const targetWeekId = getWeekId(date);
  return todayWeekId === targetWeekId;
};
