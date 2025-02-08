// @ts-nocheck
const METADATA = {
    website: "steam / xboxplayer9889",
    author: "xboxplayer9889",
    name: "ColorFeeder for QuadPainter",
    version: "0.6",
    id: "add-colorfeeder",
    description: "These building mix colors and feeds quadpainter",
    minimumGameVersion: ">=1.5.0",
};

// i may create a compnent instead, but out[uid] works i think
shapez.iptColorFeeder = {};
shapez.iptColorFeeder.reqout = [];
shapez.iptColorFeeder.out = [];
shapez.iptColorFeeder.inputlines = 3;
shapez.iptColorFeeder.outputlines = 4;

shapez.enumItemProcessorTypes.iptColorFeeder = "iptColorFeeder";
shapez.MOD_ITEM_PROCESSOR_SPEEDS.iptColorFeeder = () => 10;

shapez.MOD_ITEM_PROCESSOR_HANDLERS.iptColorFeeder = function (payload) {
    const wpins = payload.entity.components.WiredPins;
    const uid = payload.entity.uid;
    if ( !shapez.iptColorFeeder.reqout[uid] ) shapez.iptColorFeeder.reqout[uid] = [ null,null,null,null ];
    if ( !shapez.iptColorFeeder.out[uid] ) shapez.iptColorFeeder.out[uid] = [ null,null,null,null ];

    // setup required color data array from wire inputlines
    for (var i=0;i<shapez.iptColorFeeder.outputlines;i++) {
        if (wpins.slots[i].linkedNetwork)
            if (wpins.slots[i].linkedNetwork.currentValue)
                if (wpins.slots[i].linkedNetwork.currentValue._type=='color') {
                    var c = wpins.slots[i].linkedNetwork.currentValue.color;
                    shapez.iptColorFeeder.reqout[uid][i] = ( c=='uncolored' ? null : c );
                }
                else
                    shapez.iptColorFeeder.reqout[uid][i] = null;
            else
                shapez.iptColorFeeder.reqout[uid][i] = null;
        else
            shapez.iptColorFeeder.reqout[uid][i] = null;
    }
    // setup painter connection wire outputlines
    for (var k=0;k<shapez.iptColorFeeder.outputlines;k++)
        wpins.slots[shapez.iptColorFeeder.outputlines+k].value = ( shapez.iptColorFeeder.reqout[uid][k]!=null ? shapez.BOOL_TRUE_SINGLETON : shapez.BOOL_FALSE_SINGLETON );

    // handle input arrived event
    for (var i=0;i<shapez.iptColorFeeder.inputlines;i++) {
        const curitem = payload.items.get(i);
        if (curitem!=null) {
            if (curitem._type == "color") {
                var j = 0;
                while (j<shapez.iptColorFeeder.outputlines) {
                    if ( (curitem.color === shapez.iptColorFeeder.reqout[uid][j]) & (shapez.iptColorFeeder.out[uid][j]===null) ) {
                        shapez.iptColorFeeder.out[uid][j]=curitem;
                        j=shapez.iptColorFeeder.outputlines+2;
                    }
                    j++;
                }
                if (j<shapez.iptColorFeeder.outputlines+1) payload.outItems.push({
                            item: curitem,
                            requiredSlot: shapez.iptColorFeeder.outputlines,
                        });

                // check if all output ready and send them out if
                var len = 0;
                for (var k=0;k<shapez.iptColorFeeder.outputlines;k++) {
                    len += (shapez.iptColorFeeder.out[uid][k]!=null | shapez.iptColorFeeder.reqout[uid][k]===null ? 1 : 0);
                }
                if (len==shapez.iptColorFeeder.outputlines) {
                    for (var k=0;k<shapez.iptColorFeeder.outputlines;k++) {
                        if (shapez.iptColorFeeder.out[uid][k]!=null) {
                            payload.outItems.push({
                                item: shapez.iptColorFeeder.out[uid][k],
                                requiredSlot: k,
                            });
                        }
                    }
                    shapez.iptColorFeeder.out[uid] = [ null,null,null,null ];
                }
            }
            else {
                payload.outItems.push({
                    item: curitem,
                    requiredSlot: shapez.iptColorFeeder.outputlines,
                });
            }
        }
    }
}


class myColorFeeder extends shapez.ModMetaBuilding {
    constructor() {
        super("myColorFeeder");
    }

    static getAllVariantCombinations() {
        return [
            {
                variant: shapez.defaultBuildingVariant,
                name: "ColorFeeder for quadPainter",
                description: "Designed to feed quadPainter with colors, but you can use as a color splitter",

                regularImageBase64: RESOURCES["myColorFeeder.png"],
                blueprintImageBase64: RESOURCES["myColorFeeder.png"],
                tutorialImageBase64: RESOURCES["myColorFeeder.png"],

                dimensions: new shapez.Vector(4, 1),
            },
        ];
    }

    getDimensions(variant = defaultBuildingVariant) {
        return new shapez.Vector(4, 1);
    }

    getSilhouetteColor() {
        return "yellow";
    }

    getAdditionalStatistics(root) {
        const speed = root.hubGoals.getProcessorBaseSpeed(shapez.enumItemProcessorTypes.iptColorFeeder);
        return [[shapez.T.ingame.buildingPlacement.infoTexts.speed, shapez.formatItemsPerSecond(speed)]];
    }

    getIsUnlocked(root) {
        // unuseable before level 20 without mySwitch
        // return (root.hubGoals.isRewardUnlocked(shapez.enumHubGoalRewards.reward_painter_double));
        return true;
    }

    setupEntityComponents(entity) {
        entity.addComponent(
            new shapez.WiredPinsComponent({
                slots: [
                    // sign pins for colors
                    {
                        pos: new shapez.Vector(0, 0),
                        direction: shapez.enumDirection.bottom,
                        type: shapez.enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new shapez.Vector(1, 0),
                        direction: shapez.enumDirection.bottom,
                        type: shapez.enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new shapez.Vector(2, 0),
                        direction: shapez.enumDirection.bottom,
                        type: shapez.enumPinSlotType.logicalAcceptor,
                    },
                    {
                        pos: new shapez.Vector(3, 0),
                        direction: shapez.enumDirection.bottom,
                        type: shapez.enumPinSlotType.logicalAcceptor,
                    },
                    // out pins for controlling quadpainter
                    {
                        pos: new shapez.Vector(0, 0),
                        direction: shapez.enumDirection.top,
                        type: shapez.enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new shapez.Vector(1, 0),
                        direction: shapez.enumDirection.top,
                        type: shapez.enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new shapez.Vector(2, 0),
                        direction: shapez.enumDirection.top,
                        type: shapez.enumPinSlotType.logicalEjector,
                    },
                    {
                        pos: new shapez.Vector(3, 0),
                        direction: shapez.enumDirection.top,
                        type: shapez.enumPinSlotType.logicalEjector,
                    },
                ],
            })
        );

        entity.addComponent(
            new shapez.ItemAcceptorComponent({
                slots: [],
            })
        );
        entity.addComponent(
            new shapez.ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: shapez.enumItemProcessorTypes.iptColorFeeder,
            })
        );
        entity.addComponent(
            new shapez.ItemEjectorComponent({
                slots: [],
            })
        );
    }

    updateVariants(entity, rotationVariant, variant) {
        switch (variant) {
            case shapez.defaultBuildingVariant:
            {
                entity.components.ItemAcceptor.setSlots([
                        { pos: new shapez.Vector(1, 0), direction: shapez.enumDirection.bottom, },
                        { pos: new shapez.Vector(2, 0), direction: shapez.enumDirection.bottom, },
                        { pos: new shapez.Vector(3, 0), direction: shapez.enumDirection.bottom, },
                ]);
                entity.components.ItemEjector.setSlots([
                    { pos: new shapez.Vector(0, 0), direction: shapez.enumDirection.top},
                    { pos: new shapez.Vector(1, 0), direction: shapez.enumDirection.top},
                    { pos: new shapez.Vector(2, 0), direction: shapez.enumDirection.top},
                    { pos: new shapez.Vector(3, 0), direction: shapez.enumDirection.top},
                    { pos: new shapez.Vector(3, 0), direction: shapez.enumDirection.right}, // trashout
                ]);
                break;
            }
            default:
                assertAlways(false, "Unknown myColorFeeder variant: " + variant);
        }
    }
}


class mySwitchComponent extends shapez.Component {
    static getId() {
        return "mySwitchComponent";
    }

    static getSchema() {
        return {
            color: shapez.types.string,
        };
    }

    clicked() {
            switch (this.color) {
                case 'uncolored':
                    this.color = 'red';
                    break;
                case 'red':
                    this.color = 'green';
                    break;
                case 'green':
                    this.color = 'blue';
                    break;
                case 'blue':
                    this.color = 'uncolored';
                    break;
                default:
                    this.color = 'uncolored';
                    break;
            }
    }

    getSelectedColor() {
        return this.color;
    }

    getSelectedColorSingleton() {
        return new shapez.ColorItem(this.color);
    }

    constructor({ color = 'uncolored' }) {
        super();
        this.color = color;
    }
}

class mySwitchSystem extends shapez.GameSystemWithFilter {
    constructor(root) {
        super(root, [mySwitchComponent]);

        this.spriteUncolored = shapez.Loader.getSprite("sprites/mySwitch/mySwitchComponent_uncolored.png");
        this.spriteRed = shapez.Loader.getSprite("sprites/mySwitch/mySwitchComponent_red.png");
        this.spriteGreen = shapez.Loader.getSprite("sprites/mySwitch/mySwitchComponent_green.png");
        this.spriteBlue = shapez.Loader.getSprite("sprites/mySwitch/mySwitchComponent_blue.png");
        this.sprites = [];
        this.sprites['uncolored'] = this.spriteUncolored;
        this.sprites['red'] = this.spriteRed;
        this.sprites['green'] = this.spriteGreen;
        this.sprites['blue'] = this.spriteBlue;
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const mySWComp = entity.components.mySwitchComponent;
            const pinsComp = entity.components.WiredPins;

            pinsComp.slots[0].value = mySWComp.getSelectedColorSingleton();
        }
    }

    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const mySWComp = entity.components.mySwitchComponent;
            if (mySWComp) {
                const sprite = this.sprites[mySWComp.getSelectedColor()];
                entity.components.StaticMapEntity.drawSpriteOnBoundsClipped(parameters, sprite);
            }
        }
    }
}

class mySwitchOnClick extends shapez.BaseHUDPart {
    initialize() {
        this.root.camera.downPreHandler.add(this.downPreHandler, this);
    }

    downPreHandler(pos, button) {
        const tile = this.root.camera.screenToWorld(pos).toTileSpace();
        const contents = this.root.map.getLayerContentXY(tile.x, tile.y, "regular");
        if (contents) {
            const mySWComp = contents.components.mySwitchComponent;
            if (mySWComp) {
                if (button === shapez.enumMouseButton.left) {
                    mySWComp.clicked();
                    return shapez.STOP_PROPAGATION;
                }
            }
        }
    }
}

class mySwitch extends shapez.ModMetaBuilding {
    constructor() {
        super("mySwitch");
    }

    static getAllVariantCombinations() {
        return [
            {
                variant: shapez.defaultBuildingVariant,
                name: "Switch",
                description: "A switch where you can select base colors, sends out that sign on top. Designed to use with ColorFeeder below level 20.",

                regularImageBase64: RESOURCES["mySwitch.png"],
                blueprintImageBase64: RESOURCES["mySwitch.png"],
                tutorialImageBase64: RESOURCES["mySwitch.png"],

                dimensions: new shapez.Vector(1, 2),
            },
        ];
    }

    getDimensions(variant = defaultBuildingVariant) {
        return new shapez.Vector(1, 2);
    }

    getSilhouetteColor() {
        return "blue";
    }

    getIsUnlocked(root) {
        return true;
    }


    setupEntityComponents(entity) {
        entity.addComponent(
            new shapez.WiredPinsComponent({
                slots: [
                    // out pins for controlling quadpainter
                    {
                        pos: new shapez.Vector(0, 0),
                        direction: shapez.enumDirection.top,
                        type: shapez.enumPinSlotType.logicalEjector,
                    },
                ],
            })
        );
        entity.addComponent(
            new shapez.ItemAcceptorComponent({
                slots: [{ pos: new shapez.Vector(0, 1), direction: shapez.enumDirection.bottom, }],
            })
        );
        entity.addComponent(
            new shapez.ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: shapez.enumItemProcessorTypes.balancer,
            })
        );
        entity.addComponent(
            new shapez.ItemEjectorComponent({
                slots: [{ pos: new shapez.Vector(0, 0), direction: shapez.enumDirection.top }],
            })
        );
        entity.addComponent( new mySwitchComponent({}) );
    }
}

class Mod extends shapez.Mod {
    init() {

        this.modInterface.registerNewBuilding({
            metaClass: myColorFeeder,
            buildingIconBase64: RESOURCES["myColorFeeder.png"],
        });
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "regular",
            location: "primary",
            metaClass: myColorFeeder,
        });


        this.modInterface.registerComponent(mySwitchComponent);
        this.modInterface.registerNewBuilding({
            metaClass: mySwitch,
            buildingIconBase64: RESOURCES["mySwitch.png"],
        });
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "regular",
            location: "secondary",
            metaClass: mySwitch,
        });
        this.modInterface.registerGameSystem({
            id: "mySwitchSystem",
            systemClass: mySwitchSystem,
            before: "belt",
            drawHooks: ["staticAfter"],
        });
        this.modInterface.registerHudElement("update", mySwitchOnClick);

        this.modInterface.registerSprite("sprites/mySwitch/mySwitchComponent_uncolored.png", RESOURCES["mySwitchComponent_uncolored.png"]);
        this.modInterface.registerSprite("sprites/mySwitch/mySwitchComponent_red.png", RESOURCES["mySwitchComponent_red.png"]);
        this.modInterface.registerSprite("sprites/mySwitch/mySwitchComponent_green.png", RESOURCES["mySwitchComponent_green.png"]);
        this.modInterface.registerSprite("sprites/mySwitch/mySwitchComponent_blue.png", RESOURCES["mySwitchComponent_blue.png"]);
    }
}


////////////////////////////////////////////////////////////////////////

const RESOURCES = {
    "myColorFeeder.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAwAAAADACAYAAACzgQSnAAAAz3pUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVFbEsMgCPznFD0CDzV4HNOkM71Bj1+I2Ma0O+O6AWYDCPvr+YCbg0Uh5UVLLQUNqabKzYRiRzuYMB08IBGd4nAfabaQfMpQS79pxIdR3NRM5ZORhhOtc6Km8NeLEUdb3pHrLYxqGAn3BIVB62NhqbqcR1h3nKH9gFPSue2f78W2t2X7jzDvQoLGIqU3IH4ySDuEc7ZCEjVtpcZJKHZmC/m3J/SXiW5hegn5Jhz3yxTwBj1uYvQ7o1uCAAAAT3pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHja48osKEnmUgADIwsuYwsTIxNLkxQDEyBEgDTDZAND00Qgy9gwycjUxBzINwLLQEgDLgArYA8CSfV5OgAAAYNpQ0NQSUNDIHByb2ZpbGUAAHicfZE9SMNAHMVfU2tFKiJ2EHHIUJ3soiKOWoUiVAi1QqsOJpd+QZOGJMXFUXAtOPixWHVwcdbVwVUQBD9A3AUnRRcp8X9JoUWMB8f9eHfvcfcOEBoVpllds4Cm22Y6mRCzuVUx/AoBIQygG3GZWcacJKXgO77uEeDrXZxn+Z/7c/SpeYsBAZF4lhmmTbxBPL1pG5z3iaOsJKvE58TjJl2Q+JHrisdvnIsuCzwzambS88RRYrHYwUoHs5KpEU8Rx1RNp3wh67HKeYuzVqmx1j35CyN5fWWZ6zRHkMQiliBBhIIayqjARpxWnRQLadpP+PiHXb9ELoVcZTByLKAKDbLrB/+D391ahckJLymSAEIvjvMxCoR3gWbdcb6PHad5AgSfgSu97a82gJlP0uttLXYE9G8DF9dtTdkDLneAoSdDNmVXCtIUCgXg/Yy+KQcM3gK9a15vrX2cPgAZ6ip1AxwcAmNFyl73eXdPZ2//nmn19wNbT3KdnmZ/kAAAEdtpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6OTcwNjFlZjItNjZkYy1mMjRmLWJlMzItNWE1N2E5YjdhNDM0IgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc5MjNlMGRmLWVjZTAtNDU0Mi04ODZjLTlmYzEzMWM0OTQyYyIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjRkMGU2OTJmLTk0ZTctNDA0Mi1hY2NiLTZlNzhhMzBlNTdmYyIKICAgZGM6Zm9ybWF0PSJhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJMaW51eCIKICAgR0lNUDpUaW1lU3RhbXA9IjE3Mzg3NzU0NDMxODU4MzIiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zNiIKICAgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMDQtMTdUMDk6NDg6NTkrMDI6MDAiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1OjAyOjA1VDE4OjEwOjQxKzAxOjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyNTowMjowNVQxODoxMDo0MSswMTowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249ImNyZWF0ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NGQwZTY5MmYtOTRlNy00MDQyLWFjY2ItNmU3OGEzMGU1N2ZjIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDQtMTdUMDk6NDg6NTkrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZTliNDc3MGQtYjNlYi1kNTQzLWJjMmItZWM4OTYwNjE3Y2RlIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDQtMTdUMDk6NDk6NTQrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZWM5ZjkyZGItMTU0OS0yZTQ0LWJmYzEtNzEzZGJjZmM3Yjc1IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDktMjRUMTU6Mzk6MTgrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NWE5ZTE5YjItMTFmYy00ZDUwLThlZTItNGZmNTkzNDJhNGM1IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKExpbnV4KSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyNS0wMi0wNVQxODoxMDo0MyswMTowMCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgIDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+CiAgICA8cmRmOkJhZz4KICAgICA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo3YmE5NzQyOC0xMmQ5LWY2NDAtYTA3ZC1hMTEyZGVkNDNjZGM8L3JkZjpsaT4KICAgICA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5OTAyNTdhYS1hYTkzLTI1NDItOTM1My0zMzY5ODM3OWYyYzg8L3JkZjpsaT4KICAgIDwvcmRmOkJhZz4KICAgPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz4/iSEtAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6QIFEQor+zabNQAAIABJREFUeNrt3Xd8HPWd//HXzBZ1yeqy5W7jAq4YGwOxYxtCNZBwkOMgoQa4g1ACIfXyO8KFXOHIL4AhyYEhEHoIIbhgbExMtQ223HDvVbZ6l7bN3B+ysdeSbWl3JW15Px8PP+AxK41mv9/3zs5n5vudAREREREREREREREREREREREREREREREREREREREREREREREREekeycBdwBJg2+H/3gkkqWlEWRVRRkV5FZH40hdYB9jt/Ft9+HURZVVEGRXlVUTiQOpJPvxH/q0BUtRUoqyKKKOivIpI7HvqFB/+I/+eVFOJsiqijIryKiKx7dIOfviP/LtYTSbKqogyKsqriMSmfOBgJ3cAB4BcNZ0oqyLKqCivEn+MWN74Wx98zlYXntz7f32S3dtWdfr3Bg6bwPlX3qUGFGVVRBkV5VWA2Y/eYsTLezFj9cBfB/+ntmXdxyF9+AF2bVnJlnWfqBFFWRVRRkV5FeLrxLOpxo9PdTVlLF38SljrWPbBy9TXlKsxRVkVZVQZFeVViJ+T0GasNbqid2qWZfHhvGfw+zxhrcfn9fDh/GewbUuNKsqqKKPKqCivEifHpKYaOv6sWTaXsgPbI7KuQ/u3sWb5fDWqKKuijCqjorxKnBybGvHSwD///kwlEVizuoSrr7qMQCAQsXU6nE7++va7jBo9Vg0syqooo8qoKK8J45FZc0/6eqxODI75AkAH/kc1NTUx89IZ7Nq5I+LrHjx4KHPmLyYlRQ8KFGVVlFFlVJRXFQGxXAQ4dPAfP375bz/j44+WdMm6q6urqKurZfqMb6ihRVkVZVQZFeU1YUydNIypk4bx8edb2n191Wd/+2WsvSczVjtDB//BFr//Hq+8/EKX/o2XXnyeJUsWq7FFWRVlVBkV5VVimKkmiH2VlRX8+Ef3dcvf+tED91BVWalGF2VVlFFlVJTXhBJPJ59NdUDs+/GD93Xbh7Kiopyf/uQHanRRVkUZVUZFeRUVANITXnn5BT5YvLBb/+aihQt44/WX1fiirIoyqoyK8ppQ4uUktAqAGLZr5w5+/at/65G//fBDP2fP7l3qBFFWRRlVRkV5FRUA0h0Cfj8/uO9OmpqaeuTvNzU1cf99d0b0fsOirCqrooyKKK+iAkBO4InHH2PN6pIe3YaSkhU8/dRv1RmirIoyqoyK8ioqACRRPnhPPP4Ya9esUqeIsirKqDIqyquoAJCu0NTYGFWX3gJ+P/fd+y89dilSlFVlVZRRUV6VV1EBENf+/eFfRN3km56cjCTKqrIqyqgor8qrqACIW+8vWsDrr70UldvWE7cjE2VVWRVlVJRX5VVUAMSt8vKybnvaX6i684Ekoqwqq6KMivKqvIoKgLhl2zY//uG9VFdVRfV2ducjyUVZVVZFGRXlVXkVFQBx65WXXmDJksUxsa2L33+P1179kzpNWVVWRRlVRkV5FRUAEoodO7bxyK/+X0xt868e/gW7d+1U5ymryqooo8qoKK+iAiAyHpk1NyE6x7IsHrz/blpaWmJqu5uamvjhA3dj27Y+YQlCWRVlVBkV5VV5VQEgEfDu/DmsWrUyJrd95YrPWfDuXHWisqqsijKqjIryKioApKPe+ssbMb39f3nzdXWisqqsijKqjIryKioAOmf2o7cYido527dvjent37Ztiz5hyqqyKsqoMirKq6gAkI7q3buPtl/U19p+UR8ro8qrtl9UACSKe+59AKfTFZPb7nS6uOfeB9SJyqqyKsqoMirKq0RbP6kJotc5507hnbmLeOGPz7JmTQn1dXVRv80ZmZmMGTOem26+jREjT1cnKqvKqiijyqgorxJlYmJ8/a0PPtfmflI///5M9Z6IiIiIdKvjb0cfi/NVNQRIRERERCSBqAAQEREREUkgmgMgIiIiIgnv+KE98cxUJ4mIiIiIDv4Th4YAiYiIiIioABARERERERUAPSQWb68kIiIiIhKNNAlYREREROQ48XwCWkOAREREREQSiAoAEREREREVACIiIiIiogJARERERERUAIiIiIiIiAoAERERERFRARA5ifbYZhERERGRhC4AREREREREBYCIiIiIiMR6ARDPT2MTEREREVEBICIiIiIiKgBEREREREQFgIiIiIiIqAAQEREREREVACIiIiIiKgBEREREREQFgIiIiIiIqACIFo/MmqteFBERERFJlAJARERERERUAIiIiIiISKwXALMfvcVQl4mIiIiIJEgBICIiIiJyKks/+5h/+sdvMm3qJG69+Xrmzf0blmWpYQ5zqglEREREJF5s2riBG797LX6/D4A9u3fx9w8WMX78BB79zZMMHjw04dtIVwBEREREJG688Mdnvzr4P9aqVSuZeckMXv7TH7FtWwWAiIiIiEg8WLOm5ISvtbS08It//RG33nQd5eVlKgBERERE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",

    "mySwitch.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAAGACAYAAAD7823fAAAAz3pUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVFbDgIhDPzvKTxCHzzKcdBdE2/g8S20q4vahOnAkKEtsD8fd7iMYFFIuWpppaBFaqlxN6Lo0ScSpokzbiHZfjkHPShbFsvigpa4f5zT28BTN5bPRvEEXVehJc+sX0bsSUZFg29h1MJI2AUKg+5tYWlazy1cd1xDfcGApGvZP/tq09uyvSPMu5CgoUjxAmSsDNInGah2kSYnqYZZNGZmA/k3Jxw/E9XC8hPyEaJqOncBL1TyYwz8ChLxAAAAT3pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHja48osKEnmUgADIwsuYwsTIxNLkxQDEyBEgDTDZAND00Qgy9gwycjUxBzINwLLQEgDLgArYA8CSfV5OgAAAYNpQ0NQSUNDIHByb2ZpbGUAAHicfZE9SMNAHMVf04qlVBzMIOKQoTrZRUUcaxWKUCHUCq06mFz6BU1akhQXR8G14ODHYtXBxVlXB1dBEPwAcRecFF2kxP8lhRYxHhz34929x907QGhVmW6FEoBu2GYmlZRy+VWp/xUCwohAREhhVn1OltPwHV/3CPD1Ls6z/M/9OQa0gsWAgEScYHXTJt4gntm065z3iUVWVjTic+IJky5I/Mh11eM3ziWXBZ4pmtnMPLFILJV6WO1hVjZ14mnimKYblC/kPNY4b3HWqw3WuSd/YbRgrCxzneYoUljEEmRIUNFABVXYiNNqkGIhQ/tJH/+I65fJpZKrAkaOBdSgQ3H94H/wu1urODXpJUWTQN+L43yMAf27QLvpON/HjtM+AYLPwJXR9ddawOwn6c2uFjsCBreBi+uupu4BlzvA8FNdMRVXCtIUikXg/Yy+KQ8M3QKRNa+3zj5OH4AsdZW+AQ4OgfESZa/7vDvc29u/Zzr9/QAOPnJ+lurGBAAAEdtpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6OTcwNjFlZjItNjZkYy1mMjRmLWJlMzItNWE1N2E5YjdhNDM0IgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmNkMDg0Y2E1LTA5M2UtNDQ2Ny1hMmNlLWM4YmE0NjdiZGMyNSIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjRkMGU2OTJmLTk0ZTctNDA0Mi1hY2NiLTZlNzhhMzBlNTdmYyIKICAgZGM6Zm9ybWF0PSJhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJMaW51eCIKICAgR0lNUDpUaW1lU3RhbXA9IjE3MzkwMTM0NzkyMzY1NjUiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zNiIKICAgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMDQtMTdUMDk6NDg6NTkrMDI6MDAiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1OjAyOjA4VDEyOjE3OjU4KzAxOjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyNTowMjowOFQxMjoxNzo1OCswMTowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249ImNyZWF0ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NGQwZTY5MmYtOTRlNy00MDQyLWFjY2ItNmU3OGEzMGU1N2ZjIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDQtMTdUMDk6NDg6NTkrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZTliNDc3MGQtYjNlYi1kNTQzLWJjMmItZWM4OTYwNjE3Y2RlIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDQtMTdUMDk6NDk6NTQrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZWM5ZjkyZGItMTU0OS0yZTQ0LWJmYzEtNzEzZGJjZmM3Yjc1IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDktMjRUMTU6Mzk6MTgrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ODk4NDNkOTctYjA5NC00YmIyLTlkZmQtZWQ3ZjgyNDEyYzIxIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKExpbnV4KSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyNS0wMi0wOFQxMjoxNzo1OSswMTowMCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgIDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+CiAgICA8cmRmOkJhZz4KICAgICA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo3YmE5NzQyOC0xMmQ5LWY2NDAtYTA3ZC1hMTEyZGVkNDNjZGM8L3JkZjpsaT4KICAgICA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5OTAyNTdhYS1hYTkzLTI1NDItOTM1My0zMzY5ODM3OWYyYzg8L3JkZjpsaT4KICAgIDwvcmRmOkJhZz4KICAgPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz4KTkT2AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6QIICxE7rGy+sAAAEFtJREFUeNrt3W1MlfXj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",

    "mySwitchComponent_uncolored.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALYAAAF2CAYAAADDb2IEAAAAznpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVFbEsIwCPznFB4hQB7kOKmtM97A4wsBq1F3JrDJplsCcDzuN7gYiAVyaVJ7rUmRe+40lEhyjBkx5RknthoarufQalDSzJrZBYkP8HWOp4Gnoax8GMk1hG0VevZM8mVEntgqMr6HUQ8jJhcwDIY/K9UubXnakVaIL7CQZS37Z9+0e3vR/zDRwchJI3P1AthWAR6TWBS9iJOz7obyHj3ThvzrU7LJRLWwTILfguEcRACeY5NjGD7bPiwAAABPelRYdFJhdyBwcm9maWxlIHR5cGUgaXB0YwAAeNrjyiwoSeZSAAMjCy5jCxMjE0uTFAMTIESANMNkA0PTRCDL2DDJyNTEHMg3AstASAMuACtgDwJJ9Xk6AAABg2lDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV/TiqVUHMwg4pChOtlFRRxrFYpQIdQKrTqYXPoFTVqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxF5wUXaTE/yWFFjEeHPfj3b3H3TtAaFWZboUSgG7YZiaVlHL5Van/FQLCiEBESGFWfU6W0/AdX/cI8PUuzrP8z/05BrSCxYCARJxgddMm3iCe2bTrnPeJRVZWNOJz4gmTLkj8yHXV4zfOJZcFnima2cw8sUgslXpY7WFWNnXiaeKYphuUL+Q81jhvcdarDda5J39htGCsLHOd5ihSWMQSZEhQ0UAFVdiI02qQYiFD+0kf/4jrl8mlkqsCRo4F1KBDcf3gf/C7W6s4NeklRZNA34vjfIwB/btAu+k438eO0z4Bgs/AldH111rA7Cfpza4WOwIGt4GL666m7gGXO8DwU10xFVcK0hSKReD9jL4pDwzdApE1r7fOPk4fgCx1lb4BDg6B8RJlr/u8O9zb279nOv39AA4+cn6W6sYEAAAR22lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5NzA2MWVmMi02NmRjLWYyNGYtYmUzMi01YTU3YTliN2E0MzQiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MmE2MDljZmItZmJmZi00ZWMwLTlmNjgtMDQxZDlhZTIzOThmIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NGQwZTY5MmYtOTRlNy00MDQyLWFjY2ItNmU3OGEzMGU1N2ZjIgogICBkYzpmb3JtYXQ9ImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IkxpbnV4IgogICBHSU1QOlRpbWVTdGFtcD0iMTczOTAxNDIyMTE5OTk5NSIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjM2IgogICBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRlRGF0ZT0iMjAyMC0wNC0xN1QwOTo0ODo1OSswMjowMCIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjU6MDI6MDhUMTI6MzA6MTkrMDE6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDI1OjAyOjA4VDEyOjMwOjE5KzAxOjAwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo0ZDBlNjkyZi05NGU3LTQwNDItYWNjYi02ZTc4YTMwZTU3ZmMiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMC0wNC0xN1QwOTo0ODo1OSswMjowMCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplOWI0NzcwZC1iM2ViLWQ1NDMtYmMyYi1lYzg5NjA2MTdjZGUiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMC0wNC0xN1QwOTo0OTo1NCswMjowMCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplYzlmOTJkYi0xNTQ5LTJlNDQtYmZjMS03MTNkYmNmYzdiNzUiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMC0wOS0yNFQxNTozOToxOCswMjowMCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjM2U5ZDFlMS0yZmM4LTQ2MzItYTVmYy1kZTMxZGIxY2IyN2MiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoTGludXgpIgogICAgICBzdEV2dDp3aGVuPSIyMDI1LTAyLTA4VDEyOjMwOjIxKzAxOjAwIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICAgPHBob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4KICAgIDxyZGY6QmFnPgogICAgIDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjdiYTk3NDI4LTEyZDktZjY0MC1hMDdkLWExMTJkZWQ0M2NkYzwvcmRmOmxpPgogICAgIDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjk5MDI1N2FhLWFhOTMtMjU0Mi05MzUzLTMzNjk4Mzc5ZjJjODwvcmRmOmxpPgogICAgPC9yZGY6QmFnPgogICA8L3Bob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PvL20d0AAAAGYktHRAAAAAAAAPlDu38AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfpAggLHhX3Iq+wAAAFzUlEQVR42u3dX0iVZxzA8d/r345aaioZ2xxzlWW11o2DoNvugg0HQjAIGrGLrrrdtbddeTGiQAiCYLJgd90Ogrpxbc1ya0VukaGmp+kxLX13EbvbQEfqed/z+dzvPed93i8/nh3PeYoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4N8llmDTpZ6TsCs9aM/LQuU+as/MImUm6mQD/jss0JZFnWzyNYRNWUUtbmHnNmpx/w9VliAzQ0TAFqvspnWSoeub2GzJ8BCxsBE2WdrqmdrCRtggbBA2CBuEDcLedGnGritsELapbVpvMn/B2ryYkzK+ronNlk1ak9rELuuQ/YJG2OIWtbCzuAXxK3Vh527P7Bm7aUF71m5W1J63sMt8r2x/LuwtiXojP93wiYqwyz7q9V7LZ+DCzkzUa72mU6TeAn9S3/xhkGTkNU3sCprWG32iU2zBa+ayARN764ZAUqavKWwQtmm93us6RUrYIGyEDcIGYYOwQdgbYitOdHKKlLBB2OUy6dIyfc1c8CWo9Yew0Sc6OUXKxM7k5E4z8pomdoWG7Bc0whZ3+M2jsDO4BfErdWFX9P76/6x96nm70azEnWTgNYUt8E1b79QzBgAAAAAAAAAAAAAAAAAAAAAAAACA/+Akzrfo+KX2dPL2QkzdWY4X4yuxOlf+77mqJWJHT3V0HKmLzr7G+OHL6UTYxKe33ksfjMzGr9cWYvlxGrtO1MTuYw3R1luIpndro765OpLq8lvmdCWNpeJKzP/5KmbGFuPpzVI8u/E66t5PYt9AY+zpb43rn/yRCLsC9V1oTe9eLMbLydXoOd0Y3Sdboumd2szez/yTV/Hw+7kYH16IbZ1Vcehsc9w+P5sIu0L0j3alv1yejvtDpegaqI/e0zuj+YP63Nxf8dFSjA0/j4lrS7H/XEMcPNMeI0cnEmHnPOofh6bi4dXFOHx+exz4oi2393rvykz8fOGv6D5ViI/PdWQq7hqprs8vl6fj4dXFOPp1c+z9vDXX93rgi7aoKVTF6GAxagvTmXrv/mXede6p7w+V4vD57bmP+h97P2+Nw+e3x/2hUvRdaE2FncNPP+5eLEbXQH2utx//Nbm7Burj7sVifHrrvVTYOfJgZDZeTq5G7+mdFXn/vad3xsvJ1XgwMut/HvOk7v0k/fCzhvjoq46KXYOfvpmK378rxfLjtOy7MbHX4Pil9nT5cRrdJ1sqeh26T7bE8uM0jl9qT4WdA5O3F2LXiZpM//HlbWh6pzZ2naiJydsL9th5MHVnOXYfa7AQEbH7WENM3VkWdh68GF+Jtt6ChYiItt5CvBhfEXYerM5FNL1bayHizTpk4luLHtXa1DdXW4QMrYOwySVhr9FSccUiZGgdhL2WRWqJmP/zlYWIN+tQ1SLsXNjRUx0zY4sWIiJmxhZjR0+1sPOg40hdPL1ZshAR8fRmKTqO1Ak7Dzr7GuPZjdcx/6SytyPzT17Fsxuvo7Ovsezfqy9BrZEvQfkSVC7tG2iM8eGFKD5aqsj7Lz5aivHhhdg30JiJ9yvsNdrT3xrbOqtibPh5Rd7/2PDz2NZZFXv6W4WdJ9c/+SM5dLY5Jq4txb0rMxV17/euzMTEtaU4dLY5M2eN2GOv0/5zDen45VJF/Jg3IuK3b2djdLAYPWca4v5QKTO9mNjrdPBMe3SfKsToYDH3k/velZkYHSxG96lCHDzTnqn37viFdRo5OpH0j3altYXp+Gnwr5h7sOzAHFuRfHHEmbBzy6GUws49xwgDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbL6/Adj7y7anj23YAAAAAElFTkSuQmCC",

    "mySwitchComponent_red.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALYAAAF2CAYAAADDb2IEAAAAznpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVFbEsIwCPznFB4hQB7kOKmtM97A4wsBq1F3Jss2224JgeNxv8HFQCyQS5Paa02K3HOnoUKSY0zGlCdPbDU8XPeh1ZCklbWyGxIf4GsfzwAvQ1X5CJJrGNtq9OyV5CuIvLB1ZHqPoB5BTG5gBAw/Vqpd2nK0I60QX2CUZW3757np9Pai/2Gig5GTMnP1BthWAR5TGIu+iFOXycwlZqYD+TenZDcT3cJyE/w2DOdFBOAJZGVjGkKPifAAAABPelRYdFJhdyBwcm9maWxlIHR5cGUgaXB0YwAAeNrjyiwoSeZSAAMjCy5jCxMjE0uTFAMTIESANMNkA0PTRCDL2DDJyNTEHMg3AstASAMuACtgDwJJ9Xk6AAABg2lDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV/TiqVUHMwg4pChOtlFRRxrFYpQIdQKrTqYXPoFTVqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxF5wUXaTE/yWFFjEeHPfj3b3H3TtAaFWZboUSgG7YZiaVlHL5Van/FQLCiEBESGFWfU6W0/AdX/cI8PUuzrP8z/05BrSCxYCARJxgddMm3iCe2bTrnPeJRVZWNOJz4gmTLkj8yHXV4zfOJZcFnima2cw8sUgslXpY7WFWNnXiaeKYphuUL+Q81jhvcdarDda5J39htGCsLHOd5ihSWMQSZEhQ0UAFVdiI02qQYiFD+0kf/4jrl8mlkqsCRo4F1KBDcf3gf/C7W6s4NeklRZNA34vjfIwB/btAu+k438eO0z4Bgs/AldH111rA7Cfpza4WOwIGt4GL666m7gGXO8DwU10xFVcK0hSKReD9jL4pDwzdApE1r7fOPk4fgCx1lb4BDg6B8RJlr/u8O9zb279nOv39AA4+cn6W6sYEAAAR22lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5NzA2MWVmMi02NmRjLWYyNGYtYmUzMi01YTU3YTliN2E0MzQiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODcwZmM5MjMtZWI1Yi00N2VmLWJlOWYtODBiM2NjZTRiYTJhIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NGQwZTY5MmYtOTRlNy00MDQyLWFjY2ItNmU3OGEzMGU1N2ZjIgogICBkYzpmb3JtYXQ9ImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IkxpbnV4IgogICBHSU1QOlRpbWVTdGFtcD0iMTczOTAxNTU1NjE4NzczMSIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjM2IgogICBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRlRGF0ZT0iMjAyMC0wNC0xN1QwOTo0ODo1OSswMjowMCIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjU6MDI6MDhUMTI6NTI6MzUrMDE6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDI1OjAyOjA4VDEyOjUyOjM1KzAxOjAwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo0ZDBlNjkyZi05NGU3LTQwNDItYWNjYi02ZTc4YTMwZTU3ZmMiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMC0wNC0xN1QwOTo0ODo1OSswMjowMCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplOWI0NzcwZC1iM2ViLWQ1NDMtYmMyYi1lYzg5NjA2MTdjZGUiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMC0wNC0xN1QwOTo0OTo1NCswMjowMCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplYzlmOTJkYi0xNTQ5LTJlNDQtYmZjMS03MTNkYmNmYzdiNzUiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMC0wOS0yNFQxNTozOToxOCswMjowMCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphZjEzOTRlZi1hMWVjLTQ5MmYtYTZmNy02YjU5NTI2YjIyYzQiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoTGludXgpIgogICAgICBzdEV2dDp3aGVuPSIyMDI1LTAyLTA4VDEyOjUyOjM2KzAxOjAwIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICAgPHBob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4KICAgIDxyZGY6QmFnPgogICAgIDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjdiYTk3NDI4LTEyZDktZjY0MC1hMDdkLWExMTJkZWQ0M2NkYzwvcmRmOmxpPgogICAgIDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjk5MDI1N2FhLWFhOTMtMjU0Mi05MzUzLTMzNjk4Mzc5ZjJjODwvcmRmOmxpPgogICAgPC9yZGY6QmFnPgogICA8L3Bob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PkhJqk0AAAAGYktHRAAAAAAAAPlDu38AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfpAggLNCTJl2OiAAAF8klEQVR42u3cX0iVZxzA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",

    "mySwitchComponent_green.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALYAAAF2CAYAAADDb2IEAAAAz3pUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVFbEsIwCPznFB4hQB7kOKmtM97A4wsBq1F3JgvNJlsCcDzuN7gYiAVyaVJ7rUmRe+40NJHkGJMx5ckTWw0N131oNVLSyBrZBYkL+NrH08DD0Kx8GMk1hG0VevZI8mVEHtgqsnwPox5GTC5gGAx/Vqpd2vK0I60QX2CUZS3757tp9/ai/2Gig5GTMnP1AthWAR4zMRY9iHpgKNtOZoyeaUP+9SnZZKJaWCbBb8FwDiIAT2I9YxSuujb5AAAAT3pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHja48osKEnmUgADIwsuYwsTIxNLkxQDEyBEgDTDZAND00Qgy9gwycjUxBzINwLLQEgDLgArYA8CSfV5OgAAAYNpQ0NQSUNDIHByb2ZpbGUAAHicfZE9SMNAHMVf04qlVBzMIOKQoTrZRUUcaxWKUCHUCq06mFz6BU1akhQXR8G14ODHYtXBxVlXB1dBEPwAcRecFF2kxP8lhRYxHhz34929x907QGhVmW6FEoBu2GYmlZRy+VWp/xUCwohAREhhVn1OltPwHV/3CPD1Ls6z/M/9OQa0gsWAgEScYHXTJt4gntm065z3iUVWVjTic+IJky5I/Mh11eM3ziWXBZ4pmtnMPLFILJV6WO1hVjZ14mnimKYblC/kPNY4b3HWqw3WuSd/YbRgrCxzneYoUljEEmRIUNFABVXYiNNqkGIhQ/tJH/+I65fJpZKrAkaOBdSgQ3H94H/wu1urODXpJUWTQN+L43yMAf27QLvpON/HjtM+AYLPwJXR9ddawOwn6c2uFjsCBreBi+uupu4BlzvA8FNdMRVXCtIUikXg/Yy+KQ8M3QKRNa+3zj5OH4AsdZW+AQ4OgfESZa/7vDvc29u/Zzr9/QAOPnJ+lurGBAAAEdtpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6OTcwNjFlZjItNjZkYy1mMjRmLWJlMzItNWE1N2E5YjdhNDM0IgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM2Y2VhZjM5LWZkZTMtNDAxNi1iZDE0LTBhMDZkZGM3OGI3ZiIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjRkMGU2OTJmLTk0ZTctNDA0Mi1hY2NiLTZlNzhhMzBlNTdmYyIKICAgZGM6Zm9ybWF0PSJhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJMaW51eCIKICAgR0lNUDpUaW1lU3RhbXA9IjE3MzkwMTY3NjE4NDQ0MDQiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zNiIKICAgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMDQtMTdUMDk6NDg6NTkrMDI6MDAiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1OjAyOjA4VDEzOjEyOjQxKzAxOjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyNTowMjowOFQxMzoxMjo0MSswMTowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249ImNyZWF0ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NGQwZTY5MmYtOTRlNy00MDQyLWFjY2ItNmU3OGEzMGU1N2ZjIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDQtMTdUMDk6NDg6NTkrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZTliNDc3MGQtYjNlYi1kNTQzLWJjMmItZWM4OTYwNjE3Y2RlIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDQtMTdUMDk6NDk6NTQrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZWM5ZjkyZGItMTU0OS0yZTQ0LWJmYzEtNzEzZGJjZmM3Yjc1IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDktMjRUMTU6Mzk6MTgrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6OWM1MDQwZDYtODkwOS00NTczLTllZjAtN2IyZWYwNzNkMzJlIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKExpbnV4KSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyNS0wMi0wOFQxMzoxMjo0MSswMTowMCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgIDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+CiAgICA8cmRmOkJhZz4KICAgICA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo3YmE5NzQyOC0xMmQ5LWY2NDAtYTA3ZC1hMTEyZGVkNDNjZGM8L3JkZjpsaT4KICAgICA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5OTAyNTdhYS1hYTkzLTI1NDItOTM1My0zMzY5ODM3OWYyYzg8L3JkZjpsaT4KICAgIDwvcmRmOkJhZz4KICAgPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz7uyqYiAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6QIIDAwppfa1YQAABfBJREFUeNrt3E1oVFcYgOFv8uskahKTYKRtSlNr2qi1blIQ3LoTWlIICIWARbpw5bbrbF1lUUQhIBSEhha6c1sQ6ia1tdG0VjGtGEliHJtMnGhyuyjdtXaS5mfunefZZzL3nJePm8mdEwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAP8tZgi2X2CdhV3vQ9stCZT5qe2aRUhL1aOO//9RQyb4JO2VRvyzo8gO3d8JOadTiFnZmoxb3utRYgi3yf6LeiJ83sdnwab2RUf7z5LaPJnbKJrXJLWwQdhqntaktbIQNwgZhg7BB2CDsbfPyR08r73WFDcI2tU3rLefhmc2xOQ9CeQDKxM7c5DapTeyKndrrndy+ZCDszMUtamGnKu7/Cty31IVdccHaYxctaHvtYkVtv11oJu6V3Z8Lexui3txPN3yiIuwKj3rtofkMXNgpibr80JwitQH8S32ttuNEJ6dImdibOq03/0Sn2IbfmckGTOztmnrlvJ5TpIQNwq6USfey13WKlLBB2AgbhA3CBmGDsDfFdpzo5BQpYYOwK2XSlfN6TpFaNw9Bvdx2nOjkFCkTO4WTez0/7xQpE3tLpvZ6p6hv0Ag7c3H7zqOwUxX3f8XmW+rCTnXcm7f2if12oWmJO5eC3ylsgW/Zeif2GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAzJWYKNc/xiRzJ9fTFmbizH08mVWH1S+e+5pjVid29tdB5piK7+5vj2k9mcsIkPvnstuTM2Hz9fWYzl+0nsPVEX+441RXtfPna+Wh+NLbWRq628ZU5WkigVVmLh9+cxN7EUD68V49HVF9Hwei4ODDbH/oG2+Pr933LCrkL959uSmxcK8Wx6NXqHmqPnZGvsfKU+tdez8OB53P3mSUyOLsaOrpo4dKYlrp+bzwm7SgyMdyc/XZqN2yPF6B5sjL6hPdHyRmNmrq9wrxQTo49j6kop3j7bFAdPd8TY0amcsDMe9fcjM3H3i6U4fG5XvPNxe2av9dblufjx/B/Rcyof753tTFXcdVJdm58uzcbdL5bi6Gct8dZHbZm+1nc+bo+6fE2MDxeiPj+bqvdeI9W13VPfHinG4XO7Mh/13976qC0On9sVt0eK0X++LRF2Bj/9uHmhEN2DjZm+/fi3yd092Bg3LxTig+9eS4SdIXfG5uPZ9Gr0De2pyuvvG9oTz6ZX487YvD8es6Th9Vzy5odN8e6nnVW7Bj98PhO/flWM5ftJxXdjYpfh+MWOZPl+Ej0nW6t6HXpOtsby/SSOX+xIhJ0B09cXY++JulT/82Uj7HylPvaeqIvp64vusbNg5sZy7DvWZCEiYt+xppi5sSzsLHg6uRLtfXkLERHtffl4Orki7CxYfRKx89V6CxF/rUMqnlq0VeVpbKm1CClaB2GTScIuU6mwYhFStA7CLmeRWiMWfn9uIeKvdahpFXYm7O6tjbmJJQsREXMTS7G7t1bYWdB5pCEeXitaiIh4eK0YnUcahJ0FXf3N8ejqi1h4UN23IwsPnsejqy+iq7+54t+rh6DK5CEoD0Fl0oHB5pgcXYzCvVJVXn/hXikmRxfjwGBzKt6vsMu0f6AtdnTVxMTo46q8/onRx7Gjqyb2D7QJO0u+fv+33KEzLTF1pRS3Ls9V1bXfujwXU1dKcehMS2rOGnGPvUZvn21KJi8Vq+LLvBERv3w5H+PDheg93RS3R4qp6cXEXqODpzui51Q+xocLmZ/cty7PxfhwIXpO5ePg6Y5UvXfHL6zR2NGp3MB4d1Kfn40fhv+IJ3eWHZjjViRbHHEm7MxyKKWwM88xwgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGn3J0Ry+Lafn8TFAAAAAElFTkSuQmCC",

    "mySwitchComponent_blue.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALYAAAF2CAYAAADDb2IEAAAAzXpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVFRFgIhCPznFB1BQRGP47bbe92g4wdCW1bzngPr4CwKHI/7DS4GJIFSm3BnTorSS8ehiSTHmJxTmTyxcWh53YfGkaJG0kguSBzIr/18GngYmtUPI7mGsK1CLx5RvozQA1lHlu9h1MOI0IUcBsOvlbhLW652pBXiC4yKrG3/fDd9vb3qfwjxoExJmYi9AbJVgcZMjEULsxaM4DpLyR/k3zslm0x0C8sk6C0YzkEE4AlktGMbK8DpPgAAAE96VFh0UmF3IHByb2ZpbGUgdHlwZSBpcHRjAAB42uPKLChJ5lIAAyMLLmMLEyMTS5MUAxMgRIA0w2QDQ9NEIMvYMMnI1MQcyDcCy0BIAy4AK2APAkn1eToAAAGDaUNDUElDQyBwcm9maWxlAAB4nH2RPUjDQBzFX9OKpVQczCDikKE62UVFHGsVilAh1AqtOphc+gVNWpIUF0fBteDgx2LVwcVZVwdXQRD8AHEXnBRdpMT/JYUWMR4c9+PdvcfdO0BoVZluhRKAbthmJpWUcvlVqf8VAsKIQERIYVZ9TpbT8B1f9wjw9S7Os/zP/TkGtILFgIBEnGB10ybeIJ7ZtOuc94lFVlY04nPiCZMuSPzIddXjN84llwWeKZrZzDyxSCyVeljtYVY2deJp4pimG5Qv5DzWOG9x1qsN1rknf2G0YKwsc53mKFJYxBJkSFDRQAVV2IjTapBiIUP7SR//iOuXyaWSqwJGjgXUoENx/eB/8Ltbqzg16SVFk0Dfi+N8jAH9u0C76Tjfx47TPgGCz8CV0fXXWsDsJ+nNrhY7Aga3gYvrrqbuAZc7wPBTXTEVVwrSFIpF4P2MvikPDN0CkTWvt84+Th+ALHWVvgEODoHxEmWv+7w73Nvbv2c6/f0ADj5yfpbqxgQAABHbaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICB4bWxuczpHSU1QPSJodHRwOi8vd3d3LmdpbXAub3JnL3htcC8iCiAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjk3MDYxZWYyLTY2ZGMtZjI0Zi1iZTMyLTVhNTdhOWI3YTQzNCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiMDExOGRkNy1mODFjLTRjMDQtYWU0OC1hNjBjZWU1NzU2MDciCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0ZDBlNjkyZi05NGU3LTQwNDItYWNjYi02ZTc4YTMwZTU3ZmMiCiAgIGRjOmZvcm1hdD0iYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iTGludXgiCiAgIEdJTVA6VGltZVN0YW1wPSIxNzM5MDE2ODM3MDAyOTI5IgogICBHSU1QOlZlcnNpb249IjIuMTAuMzYiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA0LTE3VDA5OjQ4OjU5KzAyOjAwIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCIKICAgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNTowMjowOFQxMzoxMzo1NiswMTowMCIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjU6MDI6MDhUMTM6MTM6NTYrMDE6MDAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjRkMGU2OTJmLTk0ZTctNDA0Mi1hY2NiLTZlNzhhMzBlNTdmYyIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIwLTA0LTE3VDA5OjQ4OjU5KzAyOjAwIi8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmU5YjQ3NzBkLWIzZWItZDU0My1iYzJiLWVjODk2MDYxN2NkZSIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIwLTA0LTE3VDA5OjQ5OjU0KzAyOjAwIi8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVjOWY5MmRiLTE1NDktMmU0NC1iZmMxLTcxM2RiY2ZjN2I3NSIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIwLTA5LTI0VDE1OjM5OjE4KzAyOjAwIi8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlZDQ4ZTFjLThjNTMtNDMyNi1iNTEwLWUzOTg1MmFhNTEwOCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChMaW51eCkiCiAgICAgIHN0RXZ0OndoZW49IjIwMjUtMDItMDhUMTM6MTM6NTcrMDE6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPgogICAgPHJkZjpCYWc+CiAgICAgPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6N2JhOTc0MjgtMTJkOS1mNjQwLWEwN2QtYTExMmRlZDQzY2RjPC9yZGY6bGk+CiAgICAgPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6OTkwMjU3YWEtYWE5My0yNTQyLTkzNTMtMzM2OTgzNzlmMmM4PC9yZGY6bGk+CiAgICA8L3JkZjpCYWc+CiAgIDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+l8MW6wAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+kCCAwNONZdpNIAAAX1SURBVHja7dxfTJVlHMDx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",
};
