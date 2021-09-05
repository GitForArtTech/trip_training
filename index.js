//Loader
const loader = document.getElementById("loader");
const myDiv = document.getElementById("myDiv");
// get html document
const selectAdd = document.getElementById("selectAdd");
const selectedText = document.getElementById("mainText");
//熱門地區button
//When using getElementsByClassName, you will get array of elements instead of single array unlike getElementById.
const hotBtn = document.getElementsByClassName("btn")[0];
const hotBtn1 = document.getElementsByClassName("b1")[0];
const hotBtn2 = document.getElementsByClassName("b2")[0];
const hotBtn3 = document.getElementsByClassName("b3")[0];
const hotBtn4 = document.getElementsByClassName("b4")[0];
//各地區Box
const addrBox = document.getElementById("addrBox");
//現在分頁
let pagination = document.getElementById("pagination");
// 限制每頁最多6筆資料
const perPage = 6;

let addressArr = []; //景點資料陣列
let addrArray = []; //整理過的高雄各地區名(不重複地區名)
//過濾所有陣列中的地區(addressArr)，將需要的地區過濾出來，回傳api資料的index
let filterAddr = [];
//下拉式選單，選擇完成的地區
let selectedAddrText = "";

//send request
let request = "";
const baseURL =
  "https://api.kcg.gov.tw/api/service/get/9c8e1450-e833-499c-8320-29b36b7ace5c";

if (window.XMLHttpRequest) {
  request = new XMLHttpRequest();
} else {
  // code for older browsers
  request = new ActiveXObject("Microsoft.XMLHTTP");
}

request.onreadystatechange = function () {
  // let info = data.data.XML_Head.Infos.Info;
  if (this.readyState == 4 && this.status == 200) {
    let data = JSON.parse(this.responseText);
    let info = data.data.XML_Head.Infos.Info; // 只需要Info的資料
    //整理出不重複的地名
    for (let i = 0; i < info.length; i++) {
      //暫時印出所有地名，想過濾方法
      //現在將 Picture1 ,Name, Add, Opentime, Tel 加入陣列
      addressArr.push([
        info[i].Picture1,
        info[i].Name,
        info[i].Add,
        info[i].Opentime,
        info[i].Tel,
      ]);
      //取出景點行政區名（有重複的）
      let addrName = info[i].Add.slice(6, 9);
      if (!(addrArray.indexOf(addrName) > -1)) {
        addrArray.push(addrName);
      }
    }
    // 將不重複的地名陣列，利用forEach加入option
    // addrArray.forEach((addr, index) => {
    //   let option = document.createElement("option");
    //   option.value = index;
    //   option.innerHTML = addr;
    //   selectAdd.appendChild(option);
    // });
    // 將不重複的地名陣列，利用forEach加入option ==> IE相容性
    for (let index = 0; index < addrArray.length; index++) {
      let option = document.createElement("option");
      option.value = index;
      option.innerHTML = addrArray[index];
      selectAdd.appendChild(option);
    }
    loader.style.display = "none";
    myDiv.style.display = "block";
  }
};
//第三個參數true是非同步
request.open("GET", baseURL, true);
request.send(null);

function addrChange(selectedAddr) {
  //selectedText非空（已經選擇過地區）
  if (selectedText.innerText != " ") {
    filterAddr = [];
    //一轉換地區，就清空原本div內的Box
    addrBox.innerHTML = "";
    if (typeof selectedAddr != "number") {
      selectedAddrText = selectedAddr.options[selectedAddr.selectedIndex].text;
    } else {
      //修改目前選到地區的文字
      selectedAddrText = addrArray[selectedAddr];
      // //也要改變下拉式選單的選項
      selectAdd.selectedIndex = selectedAddr + 1;
    }

    //改變目前選擇地區 p -> div | getElementsByClassName -> getElementById
    selectedText.innerHTML = selectedAddrText;
    //self 用不到
    addressArr.filter(function (element, index, self) {
      //element[2]放的是地名
      //includes IE not support... 改用indexOf
      if (element[2].indexOf(selectedAddrText) != -1) {
        filterAddr.push(element);
      }
    });
    //新增已過濾完成的地區名Box (前6筆資料)
    //如果原本地區的景點數量不到6筆
    if (filterAddr.length < perPage) {
      for (let i = 0; i < filterAddr.length; i++) {
        createAddressBox(i);
      }
    } else {
      for (let i = 0; i < perPage; i++) {
        createAddressBox(i);
      }
    }
    //處理分頁
    getTotalPage(filterAddr);
  }
}
//建立景點div
function createAddressBox(index) {
  //createElement 如果放在最外面，就會只有一個div可以用，所以要放在裡面
  let createBox = document.createElement("div"); //包含照片跟資訊
  let boxText = document.createElement("div"); //放資訊的div
  let imgUrl = filterAddr[index][0];
  let createImg = document.createElement("img");
  createImg.src = imgUrl;
  //每一次新增的Box的css
  let boxContent =
    "border: 1px solid rgba(0, 0, 0, 0.1);padding: 20px 10px;display: flex;background: rgba(255, 255, 255, 0.432);justify-content: center;align-items: center;flex-direction: column;border-radius: 10px";
  createBox.style.cssText = boxContent;
  boxText.innerHTML =
    filterAddr[index][1] +
    "<br><br><i class='fas fa-clock'></i>&nbsp;&nbsp;" +
    filterAddr[index][3] +
    "<br><br><i class='fas fa-map-marker-alt'></i>&nbsp;&nbsp;" +
    filterAddr[index][2] +
    "<br><br><i class='fas fa-mobile-alt'></i>&nbsp;&nbsp;" +
    filterAddr[index][4];
  // 新增div
  createBox.appendChild(createImg);
  createBox.appendChild(boxText);
  addrBox.appendChild(createBox);
}
//分頁-監聽點擊事件
pagination.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.tagName === "A") {
    //點擊到分頁號碼，篩選出該頁面的資料後，顯示
    getPageData(e.target.dataset.page, filterAddr);
  }
});
//監聽熱門地區Btn 點擊事件
hotBtn.addEventListener("click", function (e) {
  e.preventDefault();
  let value = e.target.dataset.value;
  let btnStyle = "pointer-events: none ;opacity: 0.4;";
  //若熱門地區Btn不是disabled，就列出地區資料，並把該按鈕設定為disabled，不讓使用者重複按
  if (e.target.tagName === "BUTTON") {
    //其他的按鈕要是disabled = false
    //先把所有熱門地區Bt0n還原
    hotBtn1.style.cssText = "";
    hotBtn1.disabled = false;
    hotBtn2.style.cssText = "";
    hotBtn2.disabled = false;
    hotBtn3.style.cssText = "";
    hotBtn3.disabled = false;
    hotBtn4.style.cssText = "";
    hotBtn4.disabled = false;
    if (e.target.disabled != true) {
      for (let i = 0; i < addrArray.length; i++) {
        if (addrArray[i] === value) {
          //找到被點擊按鈕在addrArray的index
          addrChange(i);
        }
      }
      e.target.disabled = true;
      e.target.style.cssText = btnStyle;
    }
  }
});

// 篩選分頁資料
function getPageData(choosePage, allData) {
  //先清空頁面資料
  addrBox.innerHTML = "";
  let offset = (choosePage - 1) * perPage;
  //分好頁的資料陣列
  let thisPageData = allData.slice(offset, offset + perPage);
  for (let i = 0; i < thisPageData.length; i++) {
    //createElement 如果放在最外面，就會只有一個div可以用，所以要放在裡面
    let createBox = document.createElement("div"); //包含照片跟資訊
    let boxText = document.createElement("div"); //放資訊的div
    let imgUrl = thisPageData[i][0]; //照片網址在元素陣列(thisPageData[i])中的index為0
    let createImg = document.createElement("img");
    createImg.src = imgUrl;
    //每一次新增的Box的css
    let boxContent =
      "border: 1px solid rgba(0, 0, 0, 0.1);padding: 20px 10px;display: flex;background: rgba(255, 255, 255, 0.432);justify-content: center;align-items: center;flex-direction: column;border-radius: 10px";
    createBox.style.cssText = boxContent;
    boxText.innerHTML =
      thisPageData[i][1] +
      "<br><br><i class='fas fa-clock'></i>&nbsp;&nbsp;" +
      thisPageData[i][3] +
      "<br><br><i class='fas fa-map-marker-alt'></i>&nbsp;&nbsp;" +
      thisPageData[i][2] +
      "<br><br><i class='fas fa-mobile-alt'></i>&nbsp;&nbsp;" +
      thisPageData[i][4];
    // 新增div
    createBox.appendChild(createImg);
    createBox.appendChild(boxText);
    addrBox.appendChild(createBox);
  }
}
//計算總共頁數
function getTotalPage(addressArr) {
  //先清空原本頁碼
  pagination.innerHTML = "";
  let totalPage = Math.ceil(addressArr.length / perPage) || 1;
  let pageItemStyle =
    "margin: 30px;text-decoration: none;text-align: center; justify-content: center;align-items: center; width:300px;";
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
  pagination.style.cssText = pageItemStyle;
  pagination.innerHTML = pageItemContent;
}
