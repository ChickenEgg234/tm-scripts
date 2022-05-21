// ==UserScript==
// @name         Predict Grade
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
        const menu = $("<div>Predict Grade</div>")
        menu.addClass("menu-pdgrade")
        menu.css({
            backdropFilter: "blur(10rem)",
            textAlign: "center",
            fontWeight: "bold",
            opacity: "0.9",
            padding: "5px",
            position: "fixed",
            right: "0",
            top: "35%",
            backgroundColor: "#fdff86",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            width: "150px"
        })
        const expectScore = $("<input class='expect-score' placeholder='Expect' type='text'>")
        expectScore.css({margin:"5px", fontFamily: "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace"})
        const totalTestScore = $("<input class='total-test-score' placeholder='Total' type='text'>")
        totalTestScore.css({margin:"5px", fontFamily: "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace"})
        const predictBtn = $("<button class='predict-grade-btn'>Predict</button>")
        const resultDispaly = $("<div class='result-display'>90% accurate</div>")
        resultDispaly.css({overflowWrap: "break-word", fontWeight: "normal"})
        menu.append(expectScore)
        menu.append(totalTestScore)
        menu.append(predictBtn)
        menu.append(resultDispaly)

        parent.append(menu)
    }

    function getGradeWorth() {
        console.log("getting grade worth...")
        const categories = {}
        let worth = $("#ctl00_CategoryWeights > svg > g.dxc-labels-group > g:nth-child(2)").text()
        if (worth.length === 0) {
            return {general: {worth: 1, scores: []}}
        }
        worth = worth.split("%").slice(0, -2)
        let cate = [...$("#ctl00_CategoryWeights > svg > g.dxc-axes-group > g.dxc-arg-axis > g.dxc-arg-elements").children()].slice(0,-1)
        for (let i=0; i < cate.length; i++) {
            categories[cate[i].textContent.replaceAll(" ", "")] = {worth: parseFloat(worth[i])/100, scores:[]}
        }
        return categories
    }

    function addCategoryDropdown(categoriesObj) {
        let currentindex = 0
        if ($(".assignment-dropdown").length > 0) {currentindex = $(".assignment-dropdown")[0].selectedIndex;$(".assignment-dropdown").remove()}
        const dropdown = $("<select class='assignment-dropdown'></select>")
        for (const category in categoriesObj) {
            const index = Object.keys(categoriesObj).indexOf(category)
            const option = $(`<option value=${category}>${category}&nbsp;${index + 1}</option>`)
            dropdown.append(option)
        }
        dropdown.css({marginBlock: "1em"})
        $(".menu-pdgrade").append(dropdown)
        document.querySelector(".assignment-dropdown").selectedIndex = currentindex
    }

    // fill data into object
    function getData(res) {
        console.log("getting assignment scores...")
        const dataRow = [...$(".dx-data-row")]
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
            return total += curr
        },0)
        finalTotal = Math.round(finalTotal* 1000)/ 10
        console.log(`%c${finalTotal}`, "color:yellow;font-size:2rem;font-weight:bold");
        $(".result-display").text(finalTotal)
    }

    function addCustom(cateObj) {
        console.warn("Number Input Only")
        const expectEntry = $(".menu-pdgrade .expect-score").val().replace(" ", "").split(",")
        const totalEntry = $(".menu-pdgrade .total-test-score").val().replace(" ", "").split(",")
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
                    $(".result-display").text("ERROR")
                    throw new Error("TypeError")
                }
                console.warn(err)
            }
        }
    }

    function main() {
        console.clear()
        console.log("Hello from CEGG")
        createMenu($("body"))
        $(".predict-grade-btn").click(()=> {
            const categories = getGradeWorth()
            addCategoryDropdown(categories)
            getData(categories)
            addCustom(categories)
            calcGrade(categories)
        })
    }

    setTimeout(main, 3000)
})();