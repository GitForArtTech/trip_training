// get html document
// const content = document.getElementsByClassName("content");
const selectAdd = document.getElementById("selectAdd");
const selectedText = document.getElementById("mainText");
//熱門地區button
//When using getElementsByClassName, you will get array of elements instead of single array unlike getElementById.
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
const request = new XMLHttpRequest();
const baseURL =
  "https://api.kcg.gov.tw/api/service/get/9c8e1450-e833-499c-8320-29b36b7ace5c";
//第三個參數true是非同步
request.open("GET", baseURL, true);

request.onload = function () {
  let data = JSON.parse(this.response);
  let info = data.data.XML_Head.Infos.Info; // 只需要Info的資料

  if (request.status >= 200 && request.status < 400) {
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
    console.log(addrArray);
    // 將不重複的地名陣列，利用forEach加入option
    addrArray.forEach((addr, index) => {
      let option = document.createElement("option");
      option.value = index;
      option.innerHTML = addr;
      selectAdd.appendChild(option);
    });
  }
};

request.send(null);

function addrChange(selectedAddr) {
  //selectedText非空（已經選擇過地區）
  if (selectedText.innerText != " ") {
    //檢查user是否選擇了相同的地區，防止一直問相同資料
    // if (selectedText.innerText === addrArray[selectedAddr]) {
    //   // alert(hotBtn1.innerText);
    //   hotBtn1.style.cssText = "pointer-events: none;opacity: 0.4;";
    // } else {
    //清空原本filterAddr的內容
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
    addressArr.filter((element, index, self) => {
      //element[2]放的是地名
      //據說includes IE not support... indexOf
      if (element[2].includes(selectedAddrText)) {
        filterAddr.push(element);
      }
    });
    // //新增已過濾完成的地區名Box (前6筆資料)
    for (let i = 0; i < perPage; i++) {
      //createElement 如果放在最外面，就會只有一個div可以用，所以要放在裡面
      let createBox = document.createElement("div"); //包含照片跟資訊
      let boxText = document.createElement("div"); //放資訊的div
      let imgUrl = filterAddr[i][0];
      let createImg = document.createElement("img");
      createImg.src = imgUrl;
      //每一次新增的Box的css
      let boxContent =
        "border: 1px solid rgba(0, 0, 0, 0.1);padding: 20px 10px;display: flex;background: rgba(255, 255, 255, 0.432);justify-content: center;align-items: center;flex-direction: column;border-radius: 10px";
      createBox.style.cssText = boxContent;
      boxText.innerHTML = `${
        filterAddr[i][1]
      }${"<br><br><i class='fas fa-clock'></i>&nbsp;&nbsp;"}${
        filterAddr[i][3]
      }${"<br><br><i class='fas fa-map-marker-alt'></i>&nbsp;&nbsp;"}${
        filterAddr[i][2]
      }${"<br><br><i class='fas fa-mobile-alt'></i>&nbsp;&nbsp;"}${
        filterAddr[i][4]
      }`;
      // 新增div
      createBox.appendChild(createImg);
      createBox.appendChild(boxText);
      addrBox.appendChild(createBox);
    }
    //處理分頁
    getTotalPage(filterAddr);
    if (selectedText.innerText === addrArray[selectedAddr]) {
      // alert(hotBtn1.innerText);
      hotBtn1.style.cssText = "pointer-events: none;opacity: 0.4;";
    }
    // }
  }
}
//分頁-監聽點擊事件
pagination.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.tagName === "A") {
    //點擊到分頁號碼，篩選出該頁面的資料後，顯示
    getPageData(e.target.dataset.page, filterAddr);
  }
});

// 篩選分頁資料
function getPageData(choosePage, allData) {
  //先清空頁面資料
  addrBox.innerHTML = "";
  let offset = (choosePage - 1) * perPage;
  //分好頁的資料陣列
  let thisPageData = allData.slice(offset, offset + perPage);
  thisPageData.forEach((data) => {
    //createElement 如果放在最外面，就會只有一個div可以用，所以要放在裡面
    let createBox = document.createElement("div"); //包含照片跟資訊
    let boxText = document.createElement("div"); //放資訊的div
    let imgUrl = data[0]; //照片網址在元素陣列(data)中的index為0
    let createImg = document.createElement("img");
    createImg.src = imgUrl;
    //每一次新增的Box的css
    let boxContent =
      "border: 1px solid rgba(0, 0, 0, 0.1);padding: 20px 10px;display: flex;background: rgba(255, 255, 255, 0.432);justify-content: center;align-items: center;flex-direction: column;border-radius: 10px";
    createBox.style.cssText = boxContent;
    boxText.innerHTML = `${
      data[1]
    }${"<br><br><i class='fas fa-clock'></i>&nbsp;&nbsp;"}${
      data[3]
    }${"<br><br><i class='fas fa-map-marker-alt'></i>&nbsp;&nbsp;"}${
      data[2]
    }${"<br><br><i class='fas fa-mobile-alt'></i>&nbsp;&nbsp;"}${data[4]}`;
    // 新增div
    createBox.appendChild(createImg);
    createBox.appendChild(boxText);
    addrBox.appendChild(createBox);
  });
}
//計算總共頁數
function getTotalPage(addressArr) {
  //先清空原本頁碼
  pagination.innerHTML = "";
  // debugger;
  let totalPage = Math.ceil(addressArr.length / perPage) || 1;
  let pageItemStyle =
    "margin: 30px;text-decoration: none;text-align: center; justify-content: center;align-items: center; width:300px;";
  // let pageItemContent = "<a href='#'>&laquo;</a>";
  let pageItemContent = "";
  for (let i = 0; i < totalPage; i++) {
    pageItemContent += `<li class='pageItem' style='display: inline-block; '><a href='#${
      i + 1
    }' data-page='${i + 1}'>${i + 1}</a></li>`;
  }
  // pageItemContent += "<a href='#'>&raquo;</a>";
  pagination.style.cssText = pageItemStyle;
  pagination.innerHTML = pageItemContent;
}
