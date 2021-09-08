/**
 * 獲得HTML元素
 */
//Loader
const g_loader = document.getElementById("loader");
//整個網頁內容用div包起來
const g_contentDiv = document.getElementById("contentDiv");
// get html document
const g_selectAdd = document.getElementById("selectAdd");
//已選擇地區的文字
const g_selectedText = document.getElementById("mainText");
//熱門地區button
//When using getElementsByClassName, you will get array of elements instead of single array unlike getElementById.
const hotBtn = document.getElementById("btn");
//各地區Box
const g_addrBox = document.getElementById("addrBox");
//現在分頁
let g_pagination = document.getElementById("pagination");
/**
 * global variable
 */
// 限制每頁最多6筆資料
const g_perPage = 6;
//所有景點的資料陣列（照片網址,地名,地點,營業時間,電話）
let allDataArray = [];
//整理過的高雄各地區名(不重複地區名)
let addrArray = [];
//過濾所有陣列中的地區(allDataArray)，將需要的地區過濾出來，回傳api資料的index
let filterAddr = [];
//下拉式選單，選擇完成的地區
let g_selectedAddrText = "";

//send request
let request = "";
const baseURL =
  "https://api.kcg.gov.tw/api/service/get/9c8e1450-e833-499c-8320-29b36b7ace5c";

//checks XMLHttpRequest物件能不能建立
if (window.XMLHttpRequest) {
  //建立XMLHttpRequest()實例物件
  request = new XMLHttpRequest();
} else {
  // 丟出errors，代表使用者使用的瀏覽器比較舊，所以建立有相同功能，但可支援舊瀏覽器的ActiveXObject
  request = new ActiveXObject("Microsoft.XMLHTTP");
}
//利用open方法，設定GET請求，第三個參數true是非同步（預設）
request.open("GET", baseURL, true);
//發送請求
request.send(null);
//處理server回傳的資料，這個函數是用來處理伺服器的回應
request.onreadystatechange = function () {
  //資料錯誤處理
  try {
    //readyState如果是4，代表伺服器已經傳回所有資訊（完成）
    //且伺服器傳回的 HTTP 狀態碼為200 ok 的狀態
    if (this.readyState == 4 && this.status == 200) {
      //用變數 data 來接JSON parse解析完成的response（轉成 JavaScript的物件）
      let data = JSON.parse(this.responseText);
      // 只需要Info的資料（照片網址,地名,地點,營業時間,電話）
      let info = data.data.XML_Head.Infos.Info;
      //想要下拉式選單出現不重複的行政區名
      //先把每個景點的資料存在allDataArray陣列中
      for (let i = 0; i < info.length; i++) {
        //現在將 Picture1 ,Name, Add, Opentime, Tel 加入陣列
        allDataArray.push([
          info[i].Picture1,
          info[i].Name,
          info[i].Add,
          info[i].Opentime,
          info[i].Tel,
        ]);
        //從allDataArray中的Add，取出景點的行政區名（有重複的），存到addrName
        let addrName = info[i].Add.slice(6, 9);
        //回傳 -1，表示在addrArray陣列中找不到相同的行政區名
        if (!(addrArray.indexOf(addrName) > -1)) {
          //將不重複的行政區名，存到addrArray中
          addrArray.push(addrName);
        }
      }
      //將不重複的行政區名陣列，addrArray，裡面的資料加到下拉式選單內
      for (let index = 0; index < addrArray.length; index++) {
        //建立一個新的option元素
        let option = document.createElement("option");
        option.value = index;
        //將地區名寫入option tag 的 HTML中
        option.innerHTML = addrArray[index];
        //將option元素加進 下拉式選單g_selectAdd（只加入一個option)
        g_selectAdd.appendChild(option);
      }
      //所有資料放進下拉式選單後，loader設為display none
      g_loader.style.display = "none";
      //顯示整個網頁內容
      g_contentDiv.style.display = "block";
      //預設行政區（預設第一個）
      g_selectAdd.value = 0;
      //已選擇地區的文字也預設為第一筆資料
      g_selectedText.innerText = addrArray[0];
      //呼叫changeSelectedOption function 讓預設行政區資料可以先顯示
      changeSelectedOption(0);
    }
  } catch (error) {
    alert(error);
  }
};

function changeSelectedOption(selectedAddr) {
  //呼叫此function的情況
  //1. user直接改下拉式選單，參數selectedAddr為object
  //2. user按熱門地區Button，參數selectedAddr為number
  //g_selectedText非空（已經選擇過地區）
  //取得所有在熱門行政區的Button
  let allButton = hotBtn.getElementsByTagName("button");
  let allhotBtnLength = allButton.length;
  let allhotBtnArea = []; //所有熱門地區Btn(地名)之陣列
  //為了處理第2種情況，先把每個熱門地區Btn的value（地名）存在allhotBtnArea陣列中
  for (let i = 0; i < allhotBtnLength; i++) {
    allhotBtnArea.push(allButton[i].dataset.value);
  }
  //清空user上一個選擇的地區資料
  filterAddr = [];
  //一轉換地區，就清空原本div內的Box
  g_addrBox.innerHTML = "";
  //user改變下拉式選單內容 type為object
  if (typeof selectedAddr != "number") {
    //g_selectedAddrText接住user選擇的地區名
    g_selectedAddrText = selectedAddr.options[selectedAddr.selectedIndex].text;
    //如果下拉式選單，選到熱門地區，熱門地區Btn要變成disabled=true，才不會重複要資料
    for (let i = 0; i < allhotBtnArea.length; i++) {
      //user選擇的地區名 跟 熱門地區的地區名一樣
      if (g_selectedAddrText === allhotBtnArea[i]) {
        // debugger;
        allButton[i].disabled = true;
        allButton[i].classList.add("disalbedBtn");
        allButton[i].classList.remove("hotBtn");
      }
    }
  } else {
    //user是按Button type為number
    //g_selectedAddrText接住user選擇的地區名
    g_selectedAddrText = addrArray[selectedAddr];
    //也要改變下拉式選單的選項 (select從1開始計算，所以selectedAddr + 1)
    g_selectAdd.selectedIndex = selectedAddr + 1;
  }
  //如果選擇的地區，不是熱門地區（即按按鈕），則所有按鈕恢復原狀
  for (let i = 0; i < allhotBtnArea.length; i++) {
    if (g_selectedAddrText != allhotBtnArea[i]) {
      allButton[i].disabled = false;
      allButton[i].classList.remove("disalbedBtn");
      allButton[i].classList.add("hotBtn");
    }
  }
  //改變目前選擇地區，改變main畫面上的選擇行政區名
  g_selectedText.innerHTML = g_selectedAddrText;
  //self 用不到
  //再從所有景點的資料陣列中，取出user選的地區
  allDataArray.filter(function (element, index, self) {
    //element[2]放的是地名
    //includes IE not support... 改用indexOf
    if (element[2].indexOf(g_selectedAddrText) != -1) {
      //filterAddr是已經過濾完的資料陣列 Ex:屬於前鎮區的所有景點資料
      filterAddr.push(element);
    }
  });
  //新增已過濾完成的地區名Box (前6筆資料)
  //如果原本地區的景點數量不到6筆
  if (filterAddr.length < g_perPage) {
    for (let i = 0; i < filterAddr.length; i++) {
      createAddressBox(i);
    }
  } else {
    //如果原本地區的景點數量超過6筆，先顯示前6筆（第一頁）
    for (let i = 0; i < g_perPage; i++) {
      createAddressBox(i);
    }
  }
  //處理分頁數量
  getTotalPage(filterAddr);
}
//建立景點div
function createAddressBox(index) {
  let createBox = document.createElement("div"); //包含照片跟資訊
  let boxText = document.createElement("div"); //放資訊的div
  let imgUrl = filterAddr[index][0]; //取得景點網址
  boxText.innerHTML =
    "<div class='dataBox' style='background-image:url(" +
    imgUrl +
    ");background-size: 100% 200px; background-repeat: no-repeat;'><div class='dataTitle'>" +
    filterAddr[index][1] +
    "</div><div class='dataText'>" +
    "<br><br><i class='fas fa-clock'></i>&nbsp;&nbsp;" +
    filterAddr[index][3] +
    "<br><br><i class='fas fa-map-marker-alt'></i>&nbsp;&nbsp;" +
    filterAddr[index][2] +
    "<br><br><i class='fas fa-mobile-alt'></i>&nbsp;&nbsp;" +
    filterAddr[index][4] +
    "</div></div>";
  // 新增div
  createBox.appendChild(boxText);
  g_addrBox.appendChild(createBox);
}
//監聽熱門地區Btn 點擊事件
hotBtn.addEventListener("click", function (e) {
  e.preventDefault();
  //用value接住Btn上的行政區名
  let value = e.target.dataset.value;
  //若熱門地區Btn不是disabled，就列出地區資料，並把該按鈕設定為disabled，不讓使用者重複按
  if (e.target.tagName === "BUTTON") {
    if (e.target.disabled != true) {
      //找到value 在addrArray（不重複地區名)的位置
      for (let i = 0; i < addrArray.length; i++) {
        if (addrArray[i] === value) {
          //找到被點擊按鈕在addrArray的index
          changeSelectedOption(i);
        }
      }
      e.target.disabled = true;
      e.target.classList.remove("hotBtn");
      e.target.classList.add("disalbedBtn");
    }
  }
});
//分頁-監聽點擊事件
g_pagination.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.tagName === "A") {
    //點擊到分頁號碼，篩選出該頁面的資料後，顯示
    getPageData(e.target.dataset.page, filterAddr);
  }
});
// 篩選分頁資料
function getPageData(choosePage, allData) {
  //先清空頁面資料
  g_addrBox.innerHTML = "";
  //該頁第一筆資料，在所有資料陣列中的index
  let offset = (choosePage - 1) * g_perPage;
  //切割該頁陣列資料
  let thisPageData = allData.slice(offset, offset + g_perPage); //(6 ,12)取6~11
  for (let i = 0; i < thisPageData.length; i++) {
    createAddressBox(offset);
    offset++;
  }
}
//計算總共頁數
function getTotalPage(allDataArray) {
  //先清空原本頁碼
  g_pagination.innerHTML = "";
  let totalPage = Math.ceil(allDataArray.length / g_perPage) || 1; //無條件進位
  let pageItemContent = "";
  for (let i = 0; i < totalPage; i++) {
    pageItemContent +=
      "<li class='pageItem' style='display: inline-block;'><a href='#" +
      (i + 1) +
      "' data-page=" +
      (i + 1) +
      ">" +
      (i + 1) +
      "</a></li>";
  }
  g_pagination.innerHTML = pageItemContent;
}
