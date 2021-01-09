const formatDate = (givenDate: any) => {
    var months = [
      "Ocak", "Şubat", "Mart",
      "Nisan", "Mayıs", "Haziran", "Temmuz",
      "Ağustos", "Eylül", "Ekim",
      "Kasım", "Aralık"
    ];
   
    var date = new Date(givenDate);
    var day: any = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    if(day.toString().length === 1) {
      day = "0" + day;
    }
    
    return `${day} ${months[monthIndex]} ${year}`;
}

module.exports = { formatDate };