// Fictional economic dashboard; never substitute these values into live mode.
const samples = [['3.1','%','↑ 0.2 pp'],['4.2','%','↓ 0.3 pp'],['5.4','%','↑ 0.1 pp'],['2,850','USD / troy oz','↑ 1.4%'],['93','% of GDP','↑ 1.2 pp'],['2.8','%','↑ 0.4 pp']];
export const demoEconomy = samples.map(([value,unit,change]) => ({value,unit,change, period:'Illustrative snapshot',source:'World Pulse sample (fictional)', updated:'Not applicable'}));
export const demoRegionalGrowth = {'North America':2.5,Europe:1.4,'Asia-Pacific':4.8,Africa:3.9,'South America':2.7,'Middle East':3.2};
export const demoGrowthHistory = [2.2,2.3,2.4,2.4,2.6,2.5,2.7,2.8,2.9,3,2.9,3.1].map((value,i) => ({period:`M${i+1}`,value}));