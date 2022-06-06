
# Predict Grade

## Install

1. Install tampermonkey, https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
2. Go to TM dashboard -> Utilities Tools -> Install from URL
3. Paste this URL: `https://raw.githubusercontent.com/ChickenEgg234/tm-scripts/main/vanilla_dist.js`

## How to use

1. Click predict to get your current grade, 90% accurate due to some rounding problem or hidden grade
2. Enter your expected score and total score of the assignment
3. Click predict again and the predicted grade show be displayed

\* Categories numbers are in dropdown list

\* You can add spaces to align the numbers

## Syntax

### Earned 3.5 out of 5 in the first category

&nbsp;&nbsp;&nbsp;&nbsp;E:`3.5`

&nbsp;&nbsp;&nbsp;&nbsp;T:`5`

### Earned 1 out of 3 in category 2

&nbsp;&nbsp;&nbsp;&nbsp;E:`1 # 2`

&nbsp;&nbsp;&nbsp;&nbsp;T:`3`

*use `#` to specify assignment category*

### Earned 2 out of 3 in category 2 and 4 out of 4 in category 3

&nbsp;&nbsp;&nbsp;&nbsp;E:`2#2, 4#3`

&nbsp;&nbsp;&nbsp;&nbsp;T:`3    , 4`

*use `,` to separate different scores*

## Note

\* Try to use on a larger screen if step one fails, because some category will be hidden when the screen is small

2022-5-20
