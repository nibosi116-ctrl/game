// =====================================
// 状態
// =====================================

const player = {
    hp: 40,
    maxHp: 40,
    barrierTurns: 0
};

const enemy = {
    hp: 65,
    maxHp: 65,
    turn: 0,

    actions: [
        { type: "attack", value: 10 },
        { type: "attack", value: 10 },
        { type: "charge" },
        { type: "attack", value: 30 },
        { type: "attack", value: 10 }
    ],

    vulnerable: false
};

const cards = [
    { name: "Attack1", type: "attack", used: false },
    { name: "Attack2", type: "attack", used: false },
    { name: "Attack3", type: "attack", used: false },
    { name: "Attack4", type: "attack", used: false },
    { name: "Attack5", type: "attack", used: false },

    { name: "Buff1", type: "buff", used: false },
    { name: "Buff2", type: "buff", used: false },
    { name: "Buff3", type: "buff", used: false },

    { name: "Barrier", type: "barrier", used: false }
];

let selectedCards = [];


// =====================================
// DOM
// =====================================

const playerHpEl =
document.getElementById("playerHp");

const enemyHpEl =
document.getElementById("enemyHp");

const enemyActionEl =
document.getElementById("enemyAction");

const cardArea =
document.getElementById("cardArea");

const logEl =
document.getElementById("log");

const useButton =
document.getElementById("useButton");


// =====================================
// ログ
// =====================================

function addLog(text){

    const line =
    document.createElement("div");

    line.textContent = text;

    logEl.appendChild(line);

    logEl.scrollTop =
    logEl.scrollHeight;
}


// =====================================
// 敵行動表示
// =====================================

function updateEnemyAction(){

    const action =
    enemy.actions[enemy.turn];

    let text = "";

    if(action.type === "charge"){

        text =
        "次の行動：チャージ";

    }else{

        text =
        `次の行動：${action.value}ダメージ`;
    }

    enemyActionEl.textContent =
    text;
}


// =====================================
// HP表示
// =====================================

function updateHp(){

    playerHpEl.textContent =
    player.hp;

    enemyHpEl.textContent =
    Math.max(
        0,
        enemy.hp
    );
}


// =====================================
// カード生成
// =====================================

function renderCards(){

    cardArea.innerHTML = "";

    cards.forEach(
        (card,index)=>{

        const div =
        document.createElement("div");

        div.classList.add(
            "card"
        );

        div.classList.add(
            card.type
        );

        if(card.used){

            div.classList.add(
                "used"
            );
        }

        if(
            selectedCards.includes(
                index
            )
        ){

            div.classList.add(
                "selected"
            );
        }

        div.innerHTML =
        card.name;

        div.addEventListener(
            "click",
            ()=>selectCard(index)
        );

        cardArea.appendChild(
            div
        );

    });
}


// =====================================
// カード選択
// =====================================

function selectCard(index){

    const card =
    cards[index];

    if(card.used){
        return;
    }

    if(
        selectedCards.includes(index)
    ){

        selectedCards =
        selectedCards.filter(
            v=>v!==index
        );

    }else{

        if(
            selectedCards.length >= 2
        ){
            return;
        }

        selectedCards.push(index);
    }

    renderCards();
}


// =====================================
// ダメージ補正
// =====================================

function applyEnemyVulnerable(
    damage
){

    if(enemy.vulnerable){

        addLog(
            "チャージ効果！ ダメージ2倍"
        );

        damage *= 2;
    }

    return damage;
}


// =====================================
// プレイヤー行動
// =====================================

function useCards(){

    if(
        selectedCards.length === 0
    ){
        return;
    }

    const chosen =
    selectedCards.map(
        i => cards[i]
    );

    // 1枚
    if(chosen.length === 1){

        const card =
        chosen[0];

        if(
            card.type === "attack"
        ){

            let damage = 6;

            damage =
            applyEnemyVulnerable(
                damage
            );

            enemy.hp -= damage;

            addLog(
                `${card.name} → ${damage}ダメージ`
            );
        }

        else if(
            card.type === "buff"
        ){

            addLog(
                "バフ単体使用"
            );
        }

        else if(
            card.type === "barrier"
        ){

            player.barrierTurns = 3;

            addLog(
                "バリア展開！"
            );
        }

    }

    // 2枚
    else{

        const types =
        chosen.map(
            c=>c.type
        ).sort();

        if(
            types[0]==="attack" &&
            types[1]==="attack"
        ){

            let damage = 16;

            damage =
            applyEnemyVulnerable(
                damage
            );

            enemy.hp -= damage;

            addLog(
                "攻撃＋攻撃 → "
                + damage
            );
        }

        else if(
            types[0]==="attack" &&
            types[1]==="buff"
        ){

            let damage = 12;

            damage =
            applyEnemyVulnerable(
                damage
            );

            enemy.hp -= damage;

            addLog(
                "攻撃＋バフ → "
                + damage
            );
        }

        else if(
            types[0]==="buff" &&
            types[1]==="buff"
        ){

            addLog(
                "効果なし"
            );
        }

        else{

            addLog(
                "その組み合わせは無効"
            );
        }
    }

    // 使用済み

    selectedCards.forEach(
        i=>{
            cards[i].used = true;
        }
    );

    selectedCards = [];

    // チャージ効果終了
    if(
        enemy.vulnerable
    ){
        enemy.vulnerable = false;
    }

    renderCards();

    updateHp();

    // 勝利判定

    if(enemy.hp <= 0){

        updateHp();

        addLog(
            "勝利！"
        );

        alert(
            "敵を倒した！"
        );

        return;
    }

    enemyTurn();
}


// =====================================
// 敵ターン
// =====================================

function enemyTurn(){

    const action =
    enemy.actions[
        enemy.turn
    ];

    if(
        action.type === "charge"
    ){

        enemy.vulnerable = true;

        addLog(
            "敵はチャージした！"
        );

        addLog(
            "次のターン中は受けるダメージ2倍"
        );

    }else{

        let damage =
        action.value;

        if(
            player.barrierTurns > 0
        ){

            damage =
            Math.floor(
                damage / 2
            );

            addLog(
                "バリアで半減"
            );
        }

        player.hp -= damage;

        addLog(
            "敵の攻撃！ "
            + damage
        );
    }

    if(
        player.barrierTurns > 0
    ){
        player.barrierTurns--;
    }

    enemy.turn++;

    if(
        enemy.turn >=
        enemy.actions.length
    ){
        enemy.turn = 0;
    }

    updateEnemyAction();

    updateHp();

    if(
        player.hp <= 0
    ){

        addLog(
            "敗北..."
        );

        alert(
            "ゲームオーバー"
        );
    }
}


// =====================================
// 初期化
// =====================================

useButton.addEventListener(
    "click",
    useCards
);

updateHp();

updateEnemyAction();

renderCards();

addLog(
    "ゲーム開始！"
);