{/* <div class="card y">
    <div class="top-left">3</div>
    <div class="middle">3</div>
    <div class="bottom-right">3</div>
</div> */}

function createCard (card) {
    let color = card.split("-")[0]
    let value = card.split("-")[1]
    if (value == "skip") {
        return `<div class="card ${color} stopcard">
            <div class="top-left"><i class="fa-solid fa-ban"></i></div>
            <div class="middle"><i class="fa-solid fa-ban"></i></div>
            <div class="bottom-right"><i class="fa-solid fa-ban"></i></div>
        </div>`
    } else if (value == "reverse") {
        return `
            <div class="card ${color} reversecard">
                <div class="top-left"><i class="fa-solid fa-retweet"></i></div>
                <div class="middle"><i class="fa-solid fa-retweet"></i></div>
                <div class="bottom-right"><i class="fa-solid fa-retweet"></i></div>
        </div>
        `
    } else {
        return `
            <div class="card ${color}">
                <div class="top-left">${value}</div>
                <div class="middle">${value}</div>
                <div class="bottom-right">${value}</div>
        </div>
        `
    }
}