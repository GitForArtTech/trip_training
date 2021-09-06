//Loader
const g_loader = document.getElementById("loader");
const contentDiv = document.getElementById("contentDiv");
// get html document
const g_selectAdd = document.getElementById("selectAdd");
const selectedText = document.getElementById("mainText");
//熱門地區button
//When using getElementsByClassName, you will get array of elements instead of single array unlike getElementById.
const hotBtn = document.getElementById("btn");
const g_$hotBtn1 = document.getElementById("hotBtn1");
const g_$hotBtn2 = document.getElementById("hotBtn2");
const g_$hotBtn3 = document.getElementById("hotBtn3");
const g_$hotBtn4 = document.getElementById("hotBtn4");
//各地區Box
const g_addrBox = document.getElementById("addrBox");
//現在分頁
let g_pagination = document.getElementById("pagination");
// 限制每頁最多6筆資料
const g_perPage = 6;

let addressArr = []; //景點資料陣列
let addrArray = []; //整理過的高雄各地區名(不重複地區名)
//過濾所有陣列中的地區(addressArr)，將需要的地區過濾出來，回傳api資料的index
let filterAddr = [];
//下拉式選單，選擇完成的地區
let g_selectedAddrText = "";

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
  try {
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
      for (let index = 0; index < addrArray.length; index++) {
        let option = document.createElement("option");
        option.value = index;
        option.innerHTML = addrArray[index];
        g_selectAdd.appendChild(option);
      }
      g_loader.style.display = "none";
      contentDiv.style.display = "block";
      //預設行政區
      g_selectAdd.value = 0;
      selectedText.innerText = addrArray[0];
      changeSelectedOption(0);
    }
  } catch (error) {
    alert(error);
  }
};
//第三個參數true是非同步
request.open("GET", baseURL, true);
request.send(null);

function changeSelectedOption(selectedAddr) {
  //selectedText非空（已經選擇過地區）
  //暫時印出所有btn
  //btn 總數
  let allButton = hotBtn.getElementsByTagName("button");
  let allhotBtnLength = allButton.length;
  let allhotBtnArea = []; //所有熱門地區Btn(地名)之陣列
  // hotBtn.getElementsByTagName("button")[0].dataset.value
  for (let i = 0; i < allhotBtnLength; i++) {
    allhotBtnArea.push(allButton[i].dataset.value);
  }
  filterAddr = [];
  //一轉換地區，就清空原本div內的Box
  g_addrBox.innerHTML = "";

  if (typeof selectedAddr != "number") {
    g_selectedAddrText = selectedAddr.options[selectedAddr.selectedIndex].text;
  } else {
    //修改目前選到地區的文字
    g_selectedAddrText = addrArray[selectedAddr];
    // //也要改變下拉式選單的選項
    g_selectAdd.selectedIndex = selectedAddr + 1;
  }
  let selected = "";
  if (selectedText.innerText != " ") {
    if (typeof selectedAddr === "number") {
      selected = addrArray[selectedAddr];
    } else {
      selected = selectedAddr.innerText;
    }
    //如果選擇的地區，不是熱門地區（即按按鈕），則所有按鈕恢復原狀
    for (let i = 0; i < allhotBtnArea.length; i++) {
      if (selected != allhotBtnArea[i]) {
        allButton[i].disabled = false;
        allButton[i].classList.remove("disalbedBtn");
        allButton[i].classList.add("hotBtn");
      }
    }

    //改變目前選擇地區 p -> div | getElementsByClassName -> getElementById
    selectedText.innerHTML = g_selectedAddrText;
    //self 用不到
    addressArr.filter(function (element, index, self) {
      //element[2]放的是地名
      //includes IE not support... 改用indexOf
      if (element[2].indexOf(g_selectedAddrText) != -1) {
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
      for (let i = 0; i < g_perPage; i++) {
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
  // createBox.appendChild(createImg);
  createBox.appendChild(boxText);
  g_addrBox.appendChild(createBox);
}
//分頁-監聽點擊事件
g_pagination.addEventListener("click", function (e) {
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
    if (e.target.disabled != true) {
      for (let i = 0; i < addrArray.length; i++) {
        if (addrArray[i] === value) {
          //找到被點擊按鈕在addrArray的index
          changeSelectedOption(i);
        }
      }
      e.target.disabled = true;
      // e.target.style.cssText = btnStyle;
      e.target.classList.remove("hotBtn");
      e.target.classList.add("disalbedBtn");
    }
  }
});

// 篩選分頁資料
function getPageData(choosePage, allData) {
  //先清空頁面資料
  g_addrBox.innerHTML = "";
  let offset = (choosePage - 1) * g_perPage;
  //分好頁的資料陣列
  let thisPageData = allData.slice(offset, offset + g_perPage);
  for (let i = 0; i < thisPageData.length; i++) {
    createAddressBox(offset);
    offset++;
  }
}
//計算總共頁數
function getTotalPage(addressArr) {
  //先清空原本頁碼
  g_pagination.innerHTML = "";
  let totalPage = Math.ceil(addressArr.length / g_perPage) || 1;
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
  g_pagination.style.cssText = pageItemStyle;
  g_pagination.innerHTML = pageItemContent;
}
