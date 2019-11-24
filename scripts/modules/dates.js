const date_converter = (days) => { 
    const current_time = new Date().getTime(); 
    const one_day_ms = 86400000; 
    const ts = new Date(current_time - (one_day_ms * days)); 
    const year = ts.getFullYear(); const month = ts.getMonth() + 1; 
    const day = ts.getDate();
    
    return year + "-" + month + "-" + day;
};

const days_ago = 90;
const today = 1;

module.exports = {
    start_date: date_converter(days_ago),
    end_date: date_converter(today)   
};