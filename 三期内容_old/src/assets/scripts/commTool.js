var commTools = function () {
    this.addDate = function (date, days) {
        var d = new Date(date);
        d.setDate(d.getDate() + days);
        var m = d.getMonth() + 1;
        m = m + "";
        var y = d.getFullYear();
        y = y + "";
        var day = d.getDate();
        day = day + "";
        if (m.length == 1) {
            m = "0" + m;
        }
        if (day.length == 1) {
            day = "0" + day;
        }
        return "" + y + m + day;
    }
}

module.exports = commTools;