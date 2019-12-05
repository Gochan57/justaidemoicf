window.onload = () => {
    const scene = new Scene();
    this.scene = scene;

    // Set Google Assistant Canvas Action at scene level
    this.action = new Action(scene);
    // Call setCallbacks to register interactive canvas
    this.action.setCallbacks();
};


class Scene {
    constructor(){
        this.button = {};
        this.stats = ['Food', 'Energy', 'Health'];
        this.baseBlackTexture = PIXI.Texture.from('./img/black.png');
        const ratio = window.devicePixelRatio;

        const view = document.getElementById('view');
        this.view = {
            clientWidth: view.clientWidth,
            clientHeight: view.clientHeight,
        };

        this.app = new PIXI.Application(view.clientWidth, view.clientHeight,
            {
                transparent: true,
                autoStart: true,
                antialias: true,

                resolution: ratio,
                width: view.clientWidth,
                height: view.clientHeight,
            });

        this.app.view.style.width = `${view.clientWidth / ratio}px`;
        this.app.view.style.height = `${view.clientHeight / ratio}px`;

        view.appendChild(this.app.view);

        this.uistage = new PIXI.UI.Stage(view.clientWidth, view.clientHeight);
        this.uistage.scale.set(Math.max(view.clientWidth, view.clientHeight) / view.clientWidth);

        this.statsStage = new PIXI.UI.Stage(view.clientWidth, view.clientHeight);
        this.statsStage.scale.set(Math.max(view.clientWidth, view.clientHeight) / view.clientWidth);

        this.stats.forEach((type, index)=>{
            this.addStatButton(type, index);
        });

        this.imageStage = new PIXI.Container();
        this.imageStage.position.set(view.clientWidth / 2, view.clientHeight / 2);
        this.imageStage.scale.set(Math.max(view.clientWidth, view.clientHeight) / view.clientWidth * 0.8);

        this.app.stage.addChild(this.imageStage);
        this.app.stage.interactive = true;
        this.app.stage.addChild(this.statsStage);
        this.app.stage.addChild(this.uistage);

    }

    render=()=>{
        this.app.render()
    };

    addStatButton=(type, index)=>{
        this.button[type] = new PIXI.UI.Button({
            background: new PIXI.UI.Sprite(this.baseBlackTexture),
            text: new PIXI.UI.Text(type, new PIXI.TextStyle({fill: 'white'})),
            width: 300,
            height: 50
        });

        // console.log("addStatButton", index, this.view.clientHeight - (3 - (index + 1)) - 50)

        this.button[type].background.alpha = 0.5;
        this.button[type].x = this.view.clientWidth - 300;
        this.button[type].y = this.view.clientHeight - ((3 - (index + 1)) * 50) - 50;

        /*canvasButton.on("hover", function (over) {
            console.log('!!! BUTTON HOVER', canvasButton.text.text);
            const ease = over ? PIXI.UI.Ease.Bounce.BounceOut : PIXI.UI.Ease.Circ.CircOut;
            PIXI.UI.Tween.to(canvasButton.background, 0.5, { scale: over ? 1.15 : 1, tint: over ? "#000000" : "#000000" }, ease);
        });*/
        this.statsStage.addChild(this.button[type]);
    };

    setButtons=(buttons, canvasActions)=>{
        this.uistage.children.forEach(child=>{
            child.destroy();
        });
        this.uistage.children = [];
        let padding = 16, leftOffset = 0, leftOffsetToCenter = (buttons.length - 1) * padding + (buttons.reduce( (acc, currentValue) => acc + (currentValue.title.length * 15  + padding * 2), 0));
        this.uistage.position.set(this.view.clientWidth / 2 - leftOffsetToCenter / 2, window.clientHeight / 2);

        buttons.forEach( (button,key) => {
            let width = button.title.length * 15 + padding * 2;

            let canvasButton = new PIXI.UI.Button({
                background: new PIXI.UI.Sprite(PIXI.Texture.WHITE),
                text: new PIXI.UI.Text(button.title, new PIXI.TextStyle({fill: 'black'})),
                width: width,
                height: 50
            });

            canvasButton.background.alpha = 0.5;
            canvasButton.x = (key > 0 ? leftOffset : 0 );
            canvasButton.y = 0;

            leftOffset += width + padding;

            /*canvasButton.on("hover", function (over) {
                console.log('!!! BUTTON HOVER', canvasButton.text.text);
                const ease = over ? PIXI.UI.Ease.Bounce.BounceOut : PIXI.UI.Ease.Circ.CircOut;
                PIXI.UI.Tween.to(canvasButton.background, 0.5, { scale: over ? 1.15 : 1, tint: over ? "#000000" : "#000000" }, ease);
            });*/
            canvasButton.on("click", ()=>{

                canvasActions.sendTextQuery(canvasButton.text.text);
            });
            this.uistage.addChild(canvasButton);

        });
        this.render();

    };

    updateImage=(imageUrl, color)=>{
        console.log('imageUrl', imageUrl);
        this.imageStage.children.forEach(child=>{
            child.destroy();
        });
        this.imageStage.children = [];
        if(imageUrl){
            const sprite = PIXI.Sprite.from(imageUrl);
            if(color){
                sprite.tint = color;
            }
            sprite.anchor.set(0.5);
            this.imageStage.addChild(sprite);
        }


        this.render();

    };

    updateStats=(text)=>{
        const regexp = /your food storage is at.(\d+)|your energy is at (\d+)|and your health is at (\d+)/gi;

        let stats = [];

        let matches = text.match(regexp);
        if(matches){
            matches.forEach(match=>{
                stats.push(match.match(/(\d+)/gi));
            })
        }

        stats.forEach((stat, index)=> {
            this.button[this.stats[index]].text.value = this.stats[index]+ ": "+stat
        });

        this.render();
    }
}