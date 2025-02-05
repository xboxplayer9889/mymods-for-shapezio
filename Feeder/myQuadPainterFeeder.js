// @ts-nocheck
const METADATA = {
    website: "steam / xboxplayer9889",
    author: "xboxplayer9889",
    name: "ColorFeeder for QuadPainter",
    version: "0.5",
    id: "add-colorfeeder",
    description: "These building mix colors and feeds quadpainter",
    minimumGameVersion: ">=1.5.0",
};

const truevalue = new shapez.BooleanItem(1);
const falsevalue = new shapez.BooleanItem(0);

// i may create a component instead, but out[uid] works i think
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
    for (var k=0;k<shapez.iptColorFeeder.outputlines;k++)
        wpins.slots[shapez.iptColorFeeder.outputlines+k].value = ( shapez.iptColorFeeder.reqout[uid][k]!=null ? truevalue : falsevalue );

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
                    { pos: new shapez.Vector(3, 0), direction: shapez.enumDirection.right},
                ]);
                break;
            }
            default:
                assertAlways(false, "Unknown myColorFeeder variant: " + variant);
        }
    }
}

class Mod extends shapez.Mod {
    init() {

        // Register the new building
        this.modInterface.registerNewBuilding({
            metaClass: myColorFeeder,
            buildingIconBase64: RESOURCES["myColorFeeder.png"],
        });

        // Add it to the regular toolbar
        this.modInterface.addNewBuildingToToolbar({
            toolbar: "regular",
            location: "primary",
            metaClass: myColorFeeder,
        });
    }
}


////////////////////////////////////////////////////////////////////////

const RESOURCES = {
    "myColorFeeder.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAwAAAADACAYAAACzgQSnAAAAz3pUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVFbEsMgCPznFD0CDzV4HNOkM71Bj1+I2Ma0O+O6AWYDCPvr+YCbg0Uh5UVLLQUNqabKzYRiRzuYMB08IBGd4nAfabaQfMpQS79pxIdR3NRM5ZORhhOtc6Km8NeLEUdb3pHrLYxqGAn3BIVB62NhqbqcR1h3nKH9gFPSue2f78W2t2X7jzDvQoLGIqU3IH4ySDuEc7ZCEjVtpcZJKHZmC/m3J/SXiW5hegn5Jhz3yxTwBj1uYvQ7o1uCAAAAT3pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHja48osKEnmUgADIwsuYwsTIxNLkxQDEyBEgDTDZAND00Qgy9gwycjUxBzINwLLQEgDLgArYA8CSfV5OgAAAYNpQ0NQSUNDIHByb2ZpbGUAAHicfZE9SMNAHMVfU2tFKiJ2EHHIUJ3soiKOWoUiVAi1QqsOJpd+QZOGJMXFUXAtOPixWHVwcdbVwVUQBD9A3AUnRRcp8X9JoUWMB8f9eHfvcfcOEBoVpllds4Cm22Y6mRCzuVUx/AoBIQygG3GZWcacJKXgO77uEeDrXZxn+Z/7c/SpeYsBAZF4lhmmTbxBPL1pG5z3iaOsJKvE58TjJl2Q+JHrisdvnIsuCzwzambS88RRYrHYwUoHs5KpEU8Rx1RNp3wh67HKeYuzVqmx1j35CyN5fWWZ6zRHkMQiliBBhIIayqjARpxWnRQLadpP+PiHXb9ELoVcZTByLKAKDbLrB/+D391ahckJLymSAEIvjvMxCoR3gWbdcb6PHad5AgSfgSu97a82gJlP0uttLXYE9G8DF9dtTdkDLneAoSdDNmVXCtIUCgXg/Yy+KQcM3gK9a15vrX2cPgAZ6ip1AxwcAmNFyl73eXdPZ2//nmn19wNbT3KdnmZ/kAAAEdtpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6OTcwNjFlZjItNjZkYy1mMjRmLWJlMzItNWE1N2E5YjdhNDM0IgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc5MjNlMGRmLWVjZTAtNDU0Mi04ODZjLTlmYzEzMWM0OTQyYyIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjRkMGU2OTJmLTk0ZTctNDA0Mi1hY2NiLTZlNzhhMzBlNTdmYyIKICAgZGM6Zm9ybWF0PSJhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJMaW51eCIKICAgR0lNUDpUaW1lU3RhbXA9IjE3Mzg3NzU0NDMxODU4MzIiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zNiIKICAgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMDQtMTdUMDk6NDg6NTkrMDI6MDAiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1OjAyOjA1VDE4OjEwOjQxKzAxOjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyNTowMjowNVQxODoxMDo0MSswMTowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249ImNyZWF0ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NGQwZTY5MmYtOTRlNy00MDQyLWFjY2ItNmU3OGEzMGU1N2ZjIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDQtMTdUMDk6NDg6NTkrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZTliNDc3MGQtYjNlYi1kNTQzLWJjMmItZWM4OTYwNjE3Y2RlIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDQtMTdUMDk6NDk6NTQrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZWM5ZjkyZGItMTU0OS0yZTQ0LWJmYzEtNzEzZGJjZmM3Yjc1IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDktMjRUMTU6Mzk6MTgrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NWE5ZTE5YjItMTFmYy00ZDUwLThlZTItNGZmNTkzNDJhNGM1IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKExpbnV4KSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyNS0wMi0wNVQxODoxMDo0MyswMTowMCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgIDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+CiAgICA8cmRmOkJhZz4KICAgICA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo3YmE5NzQyOC0xMmQ5LWY2NDAtYTA3ZC1hMTEyZGVkNDNjZGM8L3JkZjpsaT4KICAgICA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5OTAyNTdhYS1hYTkzLTI1NDItOTM1My0zMzY5ODM3OWYyYzg8L3JkZjpsaT4KICAgIDwvcmRmOkJhZz4KICAgPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz4/iSEtAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6QIFEQor+zabNQAAIABJREFUeNrt3Xd8HPWd//HXzBZ1yeqy5W7jAq4YGwOxYxtCNZBwkOMgoQa4g1ACIfXyO8KFXOHIL4AhyYEhEHoIIbhgbExMtQ223HDvVbZ6l7bN3B+ysdeSbWl3JW15Px8PP+AxK41mv9/3zs5n5vudAREREREREREREREREREREREREREREREREREREREREREREREREekeycBdwBJg2+H/3gkkqWlEWRVRRkV5FZH40hdYB9jt/Ft9+HURZVVEGRXlVUTiQOpJPvxH/q0BUtRUoqyKKKOivIpI7HvqFB/+I/+eVFOJsiqijIryKiKx7dIOfviP/LtYTSbKqogyKsqriMSmfOBgJ3cAB4BcNZ0oqyLKqCivEn+MWN74Wx98zlYXntz7f32S3dtWdfr3Bg6bwPlX3qUGFGVVRBkV5VWA2Y/eYsTLezFj9cBfB/+ntmXdxyF9+AF2bVnJlnWfqBFFWRVRRkV5FeLrxLOpxo9PdTVlLF38SljrWPbBy9TXlKsxRVkVZVQZFeVViJ+T0GasNbqid2qWZfHhvGfw+zxhrcfn9fDh/GewbUuNKsqqKKPKqCivEifHpKYaOv6sWTaXsgPbI7KuQ/u3sWb5fDWqKKuijCqjorxKnBybGvHSwD///kwlEVizuoSrr7qMQCAQsXU6nE7++va7jBo9Vg0syqooo8qoKK8J45FZc0/6eqxODI75AkAH/kc1NTUx89IZ7Nq5I+LrHjx4KHPmLyYlRQ8KFGVVlFFlVJRXFQGxXAQ4dPAfP375bz/j44+WdMm6q6urqKurZfqMb6ihRVkVZVQZFeU1YUydNIypk4bx8edb2n191Wd/+2WsvSczVjtDB//BFr//Hq+8/EKX/o2XXnyeJUsWq7FFWRVlVBkV5VVimKkmiH2VlRX8+Ef3dcvf+tED91BVWalGF2VVlFFlVJTXhBJPJ59NdUDs+/GD93Xbh7Kiopyf/uQHanRRVkUZVUZFeRUVANITXnn5BT5YvLBb/+aihQt44/WX1fiirIoyqoyK8ppQ4uUktAqAGLZr5w5+/at/65G//fBDP2fP7l3qBFFWRRlVRkV5FRUA0h0Cfj8/uO9OmpqaeuTvNzU1cf99d0b0fsOirCqrooyKKK+iAkBO4InHH2PN6pIe3YaSkhU8/dRv1RmirIoyqoyK8ioqACRRPnhPPP4Ya9esUqeIsirKqDIqyquoAJCu0NTYGFWX3gJ+P/fd+y89dilSlFVlVZRRUV6VV1EBENf+/eFfRN3km56cjCTKqrIqyqgor8qrqACIW+8vWsDrr70UldvWE7cjE2VVWRVlVJRX5VVUAMSt8vKybnvaX6i684Ekoqwqq6KMivKqvIoKgLhl2zY//uG9VFdVRfV2ducjyUVZVVZFGRXlVXkVFQBx65WXXmDJksUxsa2L33+P1179kzpNWVVWRRlVRkV5FRUAEoodO7bxyK/+X0xt868e/gW7d+1U5ymryqooo8qoKK+iAiAyHpk1NyE6x7IsHrz/blpaWmJqu5uamvjhA3dj27Y+YQlCWRVlVBkV5VV5VQEgEfDu/DmsWrUyJrd95YrPWfDuXHWisqqsijKqjIryKioApKPe+ssbMb39f3nzdXWisqqsijKqjIryKioAOmf2o7cYido527dvjent37Ztiz5hyqqyKsqoMirKq6gAkI7q3buPtl/U19p+UR8ro8qrtl9UACSKe+59AKfTFZPb7nS6uOfeB9SJyqqyKsqoMirKq0RbP6kJotc5507hnbmLeOGPz7JmTQn1dXVRv80ZmZmMGTOem26+jREjT1cnKqvKqiijyqgorxJlYmJ8/a0PPtfmflI///5M9Z6IiIiIdKvjb0cfi/NVNQRIRERERCSBqAAQEREREUkgmgMgIiIiIgnv+KE98cxUJ4mIiIiIDv4Th4YAiYiIiIioABARERERERUAPSQWb68kIiIiIhKNNAlYREREROQ48XwCWkOAREREREQSiAoAEREREREVACIiIiIiogJARERERERUAIiIiIiIiAoAERERERFRARA5ifbYZhERERGRhC4AREREREREBYCIiIiIiMR6ARDPT2MTEREREVEBICIiIiIiKgBEREREREQFgIiIiIiIqAAQEREREREVACIiIiIiKgBEREREREQFgIiIiIiIqACIFo/MmqteFBERERFJlAJARERERERUAIiIiIiISKwXALMfvcVQl4mIiIiIJEgBICIiIiJyKks/+5h/+sdvMm3qJG69+Xrmzf0blmWpYQ5zqglEREREJF5s2riBG797LX6/D4A9u3fx9w8WMX78BB79zZMMHjw04dtIVwBEREREJG688Mdnvzr4P9aqVSuZeckMXv7TH7FtWwWAiIiIiEg8WLOm5ISvtbS08It//RG33nQd5eVlKgBERERE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",
};
