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

shapez.iptColorFeeder = {};
shapez.iptColorFeeder.reqout = [ null,null,null,null ];
shapez.iptColorFeeder.out = [ null,null,null,null ];
shapez.enumItemProcessorTypes.iptColorFeeder = "iptColorFeeder";
shapez.MOD_ITEM_PROCESSOR_SPEEDS.iptColorFeeder = () => 10;
shapez.MOD_ITEM_PROCESSOR_HANDLERS.iptColorFeeder = function (payload) {
    const wpins = payload.entity.components.WiredPins;
    for (var i=0;i<4;i++) {
        if (wpins.slots[i].linkedNetwork)
            if (wpins.slots[i].linkedNetwork.currentValue)
                if (wpins.slots[i].linkedNetwork.currentValue._type=='color') {
                    var c = wpins.slots[i].linkedNetwork.currentValue.color;
                    shapez.iptColorFeeder.reqout[i] = ( c=='uncolored' ? null : c );
                }
                else
                    shapez.iptColorFeeder.reqout[i] = null;
            else
                shapez.iptColorFeeder.reqout[i] = null;
        else
            shapez.iptColorFeeder.reqout[i] = null;
    }
    for (var i=0;i<3;i++) {
        const curitem = payload.items.get(i);
        if (curitem!=null) {
            if (curitem._type == "color") {
                var j = 0;
                while (j<4) {
                    if ( (curitem.color === shapez.iptColorFeeder.reqout[j]) & (shapez.iptColorFeeder.out[j]===null) ) {
                        shapez.iptColorFeeder.out[j]=curitem;
                        j=5;
                    }
                    j++;
                }
                if (j<5) payload.outItems.push({
                            item: curitem,
                            requiredSlot: 4,
                        });

                var len = 0;
                for (var k=0;k<4;k++) {
                    len += (shapez.iptColorFeeder.out[k]!=null | shapez.iptColorFeeder.reqout[k]===null ? 1 : 0);
                }
                if (len==4) {
                    for (var k=0;k<4;k++) {
                        if (shapez.iptColorFeeder.out[k]!=null) {
                            payload.outItems.push({
                                item: shapez.iptColorFeeder.out[k],
                                requiredSlot: k,
                            });
                        }
                    }
                    shapez.iptColorFeeder.out = [ null,null,null,null ];
                }
            }
            else {
                payload.outItems.push({
                    item: curitem,
                    requiredSlot: 4,
                });
            }
        }
    }
    const truevalue = new shapez.BooleanItem(1);
    const falsevalue = new shapez.BooleanItem(0);
    for (var k=0;k<4;k++)
        wpins.slots[4+k].value = ( shapez.iptColorFeeder.reqout[k]!=null ? truevalue : falsevalue );
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
//                        { pos: new shapez.Vector(0, 0), direction: shapez.enumDirection.left, filter: "liquid" },
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
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAwAAAADACAYAAACzgQSnAAAAz3pUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVFbEsMgCPznFD0CDzV4HNOkM71Bj1+I2Ma0O+O6grMCwv56PuDmYFFIedFSS0FDqqlyM6HY0Q4mTAcPSESnONxHmi0kn2uope804sModmqm8slIw4nWOVFT+OvFiKMsr8j1FkY1jIR7gsKg9bawVF3OLaw7ztC+wCnpXPbPebHpbdneEeZdSNBYpPQCxFcGaYdwTnaRpJomycZZKGZmA/k3J/SfiWph+gn5Jhz3SxfwBj+eYvrYKEHDAAAAT3pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHja48osKEnmUgADIwsuYwsTIxNLkxQDEyBEgDTDZAND00Qgy9gwycjUxBzINwLLQEgDLgArYA8CSfV5OgAAAYNpQ0NQSUNDIHByb2ZpbGUAAHicfZE9SMNAHMVf05aKtAjaQcQhQ3Wyi4o41ioUoUKoFVp1MLn0C5q0JCkujoJrwcGPxaqDi7OuDq6CIPgB4i44KbpIif9LCi1iPDjux7t7j7t3gNCqMs0MJABNt4xMKinm8qti6BUCAhhEEBGZmfU5SUrDc3zdw8fXuzjP8j7354ioBZMBPpE4weqGRbxBPLNp1TnvE0dZWVaJz4knDLog8SPXFZffOJccFnhm1Mhm5omjxGKph5UeZmVDI54mjqmaTvlCzmWV8xZnrdpgnXvyF4YL+soy12mOIoVFLEGCCAUNVFCFhTitOikmMrSf9PCPOH6JXAq5KmDkWEANGmTHD/4Hv7s1i1OTblI4CQRfbPtjDAjtAu2mbX8f23b7BPA/A1d6119rAbOfpDe7WuwIGNgGLq67mrIHXO4Aw0912ZAdyU9TKBaB9zP6pjwwdAv0r7m9dfZx+gBkqav0DXBwCIyXKHvd4919vb39e6bT3w8JLnJ82rkGdgAAEdtpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6OTcwNjFlZjItNjZkYy1mMjRmLWJlMzItNWE1N2E5YjdhNDM0IgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmQ1MTk4ZmI5LWNmY2EtNDkzMy05OGY1LWJhYTU1OGI2ZmI2NiIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjRkMGU2OTJmLTk0ZTctNDA0Mi1hY2NiLTZlNzhhMzBlNTdmYyIKICAgZGM6Zm9ybWF0PSJhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJMaW51eCIKICAgR0lNUDpUaW1lU3RhbXA9IjE3Mzg2OTI5NTI2NTMzNTQiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zNiIKICAgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMDQtMTdUMDk6NDg6NTkrMDI6MDAiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1OjAyOjA0VDE5OjE1OjUxKzAxOjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyNTowMjowNFQxOToxNTo1MSswMTowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249ImNyZWF0ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NGQwZTY5MmYtOTRlNy00MDQyLWFjY2ItNmU3OGEzMGU1N2ZjIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDQtMTdUMDk6NDg6NTkrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZTliNDc3MGQtYjNlYi1kNTQzLWJjMmItZWM4OTYwNjE3Y2RlIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDQtMTdUMDk6NDk6NTQrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZWM5ZjkyZGItMTU0OS0yZTQ0LWJmYzEtNzEzZGJjZmM3Yjc1IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjAtMDktMjRUMTU6Mzk6MTgrMDI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MzE0YTIyOWEtOGRkYi00NzRiLThkYmMtY2RlNDRiMmJhNGI2IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKExpbnV4KSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyNS0wMi0wNFQxOToxNTo1MiswMTowMCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgIDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+CiAgICA8cmRmOkJhZz4KICAgICA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo3YmE5NzQyOC0xMmQ5LWY2NDAtYTA3ZC1hMTEyZGVkNDNjZGM8L3JkZjpsaT4KICAgICA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5OTAyNTdhYS1hYTkzLTI1NDItOTM1My0zMzY5ODM3OWYyYzg8L3JkZjpsaT4KICAgIDwvcmRmOkJhZz4KICAgPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz50wwEzAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6QIEEg80sbO7uQAAIABJREFUeNrt3XmUnFWd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",
};
