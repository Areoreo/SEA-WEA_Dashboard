// components/Calendar.js
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const Calendar = ({ onDateChange }) => {
    // const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const handleDateChange = (date) => {
        setSelectedDate(date); // 更新状态
        if (onDateChange) {
            onDateChange(date); // 通知父组件
        }
    };

    return (
        <div class="georgia_text">
            <h4>Select a Date</h4>
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                // onChange={(date) => setSelectedDate(date)} // can be added inside above onChange = {} maybe? or just delete it (tested, can still work without this)
                showMonthDropdown // 显示月份下拉菜单
                showYearDropdown // 显示年份下拉菜单
                dropdownMode="select" // 使用 "select" 模式以便下拉
                dateFormat="yyyy-MM-dd" // 日期格式
                yearDropdownItemNumber={10} // 显示的年份范围（过去和未来各10年）
                scrollableYearDropdown // 允许滚动年份选择
            />
        </div>
    );
};

// export default Calendar;
