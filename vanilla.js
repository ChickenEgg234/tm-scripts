// ==UserScript==
// @name         Predict Grade Vanilla
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  try to take over the world!
// @author       You
// @match        https://portal.sfusd.edu/PXP2_Gradebook.aspx?*
// @match        https://studentportal.sfusd.edu/PXP2_Gradebook.aspx?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log("Script started")

    function createMenu(parent) {
        // const menu = $("<div>Predict Grade</div>")
        const menu = document.createElement("div")
        menu.innerText = "Predict Grade"

        // menu.addClass("menu-pdgrade")
        menu.classList.add("menu-pdgrade")

        // menu.css({
            // backdropFilter: "blur(10rem)",
            // textAlign: "center",
            // fontWeight: "bold",
            // opacity: "0.9",
            // padding: "5px",
            // position: "fixed",
            // right: "0",
            // top: "35%",
            // backgroundColor: "#fdff86",
            // display: "flex",
            // justifyContent: "center",
            // flexDirection: "column",
            // width: "150px"
        // })

        menu.style.backdropFilter = "blur(10rem)"
        menu.style.textAlign = "center"
        menu.style.fontWeight = "bold"
        menu.style.opacity = "0.9"
        menu.style.padding = "5px"
        menu.style.position = "fixed"
        menu.style.right = "0"
        menu.style.top = "35%"
        menu.style.backgroundColor = "#70c470"
        menu.style.display = "flex"
        menu.style.justifyContent = "center"
        menu.style.flexDirection = "column"
        menu.style.width = "150px"

        // const expectScore = $("<input class='expect-score' placeholder='Expect' type='text'>")
        const expectScore = document.createElement("input")
        expectScore.classList.add("expect-score")
        expectScore.placeholder = "Expect"
        expectScore.type = "text"

        // expectScore.css({margin:"5px", fontFamily: "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace"})
        expectScore.style.margin = "5px"
        expectScore.style. fontFamily = "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace"

        // const totalTestScore = $("<input class='total-test-score' placeholder='Total' type='text'>")
        const totalTestScore = document.createElement("input")
        totalTestScore.classList.add("total-test-score")
        totalTestScore.placeholder = "Total"
        totalTestScore.type = "text"

        // totalTestScore.css({margin:"5px", fontFamily: "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace"})
        totalTestScore.style.margin = "5px"
        totalTestScore.style. fontFamily = "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace"

        // const predictBtn = $("<button class='predict-grade-btn'>Predict</button>")
        const predictBtn = document.createElement("button")
        predictBtn.innerText = "Predict"
        predictBtn.classList.add("predict-grade-btn")

        // const resultDispaly = $("<div class='result-display'>90% accurate</div>")
        const resultDispaly = document.createElement("div")
        resultDispaly.classList.add("result-display")
        resultDispaly.innerText = "90% accurate"

        // resultDispaly.css({overflowWrap: "break-word", fontWeight: "normal"})
        resultDispaly.style.overflowWrap = "break-word"
        resultDispaly.style.fontWeight = "normal"

        menu.appendChild(expectScore)
        menu.appendChild(totalTestScore)
        menu.appendChild(predictBtn)
        menu.appendChild(resultDispaly)

        parent.appendChild(menu)
    }

    function getGradeWorth() {
        console.log("getting grade worth...")
        const categories = {}
        // let worth = $("#ctl00_CategoryWeights > svg > g.dxc-labels-group > g:nth-child(2)").text()
        let worth = document.querySelector("#ctl00_CategoryWeights > svg > g.dxc-labels-group > g:nth-child(2)").textContent
        if (worth.length === 0) {
            return {general: {worth: 1, scores: []}}
        }
        worth = worth.split("%").slice(0, -2)
        // let cate = [...$("#ctl00_CategoryWeights > svg > g.dxc-axes-group > g.dxc-arg-axis > g.dxc-arg-elements").children()].slice(0,-1)
        let cate = [...document.querySelector("#ctl00_CategoryWeights > svg > g.dxc-axes-group > g.dxc-arg-axis > g.dxc-arg-elements").children].slice(0,-1)
        for (let i=0; i < cate.length; i++) {
            categories[cate[i].textContent.replaceAll(" ", "")] = {worth: parseFloat(worth[i])/100, scores:[]}
        }
        return categories
    }

    function addCategoryDropdown(categoriesObj) {
        let currentindex = 0
        // if ($(".assignment-dropdown").length > 0) {currentindex = $(".assignment-dropdown")[0].selectedIndex;$(".assignment-dropdown").remove()}
        if (document.querySelector(".assignment-dropdown") != null) {currentindex = document.querySelector(".assignment-dropdown")[0].selectedIndex;document.querySelector(".assignment-dropdown").remove()}
        // const dropdown = $("<select class='assignment-dropdown'></select>")
        const dropdown = document.createElement("select")
        dropdown.classList.add("assignment-dropdown")
        for (const category in categoriesObj) {
            const index = Object.keys(categoriesObj).indexOf(category)
            // const option = $(`<option value=${category}>${category}&nbsp;${index + 1}</option>`)
            const option = document.createElement("option")
            option.value = `${category}`
            option.innerText = `${category} ${index + 1}`
            dropdown.appendChild(option)
        }
        dropdown.style.marginBlock = "1em"
        document.querySelector(".menu-pdgrade").appendChild(dropdown)
        document.querySelector(".assignment-dropdown").selectedIndex = currentindex
    }

    // fill data into object
    function getData(res) {
        console.log("getting assignment scores...")
        // const dataRow = [...$(".dx-data-row")]
        const dataRow = [...document.querySelectorAll(".dx-data-row")]
        const regex = /(\d+\.?\d*)[^\.\d]+(\d+\.?\d*)/

        for (const row of dataRow) {
            const column = row.children
            const result = column[7].textContent.match(regex)
            if (res.general != null) {
                if (result !=null) {
                    res.general.scores.push(result[0])
                }
            }else {
                const asmtCategory = column[3].textContent.replaceAll(" ", "")
                if (result != null) {
                    res[asmtCategory].scores.push(result[0])
                }
            }
        }
    }

    function calcGrade(CatObj) {
        let point = []
        for (const category in CatObj) {
            let earned = 0, total = 0
            const {worth, scores} = CatObj[category]
            if (scores.length === 0) {point.push(worth); continue}
            for (const score of scores) {
                const [subearned, subtotal] = score.split("/")
                earned += parseFloat(subearned)
                total += parseFloat(subtotal)
            }
            point.push(earned / total * worth)
        }
        console.log(point);
        let finalTotal = point.reduce((total, curr) => {
            total += curr
            return total
        },0)
        finalTotal = Math.round(finalTotal* 1000)/ 10
        console.log(`%c${finalTotal}`, "color:yellow;font-size:2rem;font-weight:bold");
        // $(".result-display").text(finalTotal)
        document.querySelector(".result-display").textContent = finalTotal
    }

    function addCustom(cateObj) {
        console.warn("Number Input Only")
        // const expectEntry = $(".menu-pdgrade .expect-score").val().replace(" ", "").split(",")
        const expectEntry = document.querySelector(".menu-pdgrade .expect-score").value.replace(" ", "").split(",")
        // const totalEntry = $(".menu-pdgrade .total-test-score").val().replace(" ", "").split(",")
        const totalEntry = document.querySelector(".menu-pdgrade .total-test-score").value.replace(" ", "").split(",")
        console.log("add prediction grade...");
        console.log(cateObj);
        const categories_arr = Object.keys(cateObj)
        for (let i=0; i< expectEntry.length; i++) {
            try{
                if (expectEntry[i] === '') continue
                const selectedIndex = expectEntry[i].split("#") // match structure like this "22#2" (score#category)
                if (isNaN(parseFloat(selectedIndex[0])) || isNaN(parseFloat(expectEntry[i]))) continue
                if (selectedIndex[1] == null) {selectedIndex[1] = 1} // if category not given, set to the first one
                cateObj[categories_arr[parseInt(selectedIndex[1])-1]].scores.push(`${selectedIndex[0]}/${totalEntry[i]}`) // categories obj push in added grade
            }catch (err){
                if (err.name === "TypeError") {
                    // $(".result-display").text("ERROR")
                    document.querySelector(".result-display").textContent = "ERROR"
                    throw new Error("TypeError")
                }
                console.warn(err)
            }
        }
    }

    function main() {
        console.clear()
        console.log("Hello from CEGG")
        createMenu(document.body)
        document.querySelector(".predict-grade-btn").addEventListener("click", ()=>{
            const categories = getGradeWorth()
            addCategoryDropdown(categories)
            getData(categories)
            addCustom(categories)
            calcGrade(categories)
        })
    }

    setTimeout(main, 3000)
})();