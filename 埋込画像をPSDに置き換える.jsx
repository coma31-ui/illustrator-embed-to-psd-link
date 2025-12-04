// 埋め込み画像をPSDリンク画像に置き換えるスクリプト
// Adobe Illustrator用

(function() {
    // アクティブなドキュメントの確認
    if (app.documents.length === 0) {
        alert("ドキュメントが開かれていません。");
        return;
    }
    
    var doc = app.activeDocument;
    var imageItems = [];
    
    // 選択されているアイテムを確認
    if (doc.selection.length === 0) {
        alert("画像を選択してください。");
        return;
    }
    
    // 選択されたアイテムから画像を取得
    for (var i = 0; i < doc.selection.length; i++) {
        var item = doc.selection[i];
        
        // 埋め込み画像の場合
        if (item.typename === "PlacedItem" && item.embedded) {
            imageItems.push({type: "placed", item: item});
        }
        // ラスタライズされた画像の場合
        else if (item.typename === "RasterItem") {
            imageItems.push({type: "raster", item: item});
        }
        // グループの場合、中身をチェック
        else if (item.typename === "GroupItem") {
            checkGroupItems(item, imageItems);
        }
    }
    
    if (imageItems.length === 0) {
        alert("選択した中に埋め込み画像または貼り付け画像が見つかりませんでした。");
        return;
    }
    
    // グループ内のアイテムを再帰的にチェックする関数
    function checkGroupItems(group, items) {
        for (var i = 0; i < group.pageItems.length; i++) {
            var item = group.pageItems[i];
            if (item.typename === "PlacedItem" && item.embedded) {
                items.push({type: "placed", item: item});
            } else if (item.typename === "RasterItem") {
                items.push({type: "raster", item: item});
            } else if (item.typename === "GroupItem") {
                checkGroupItems(item, items);
            }
        }
    }
    
    // PSD解像度の入力ダイアログ
    var dialog = new Window("dialog", "PSD設定");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 10;
    dialog.margins = 16;
    
    // 解像度入力
    var resGroup = dialog.add("group");
    resGroup.orientation = "row";
    resGroup.add("statictext", undefined, "PSD解像度 (dpi):");
    var resInput = resGroup.add("edittext", undefined, "300");
    resInput.characters = 10;
    
    // カラーモード選択
    var colorGroup = dialog.add("group");
    colorGroup.orientation = "row";
    colorGroup.add("statictext", undefined, "カラーモード:");
    var colorDropdown = colorGroup.add("dropdownlist", undefined, ["RGB", "CMYK"]);
    colorDropdown.selection = 0; // デフォルトはRGB
    
    // 情報表示
    var infoGroup = dialog.add("panel", undefined, "処理対象");
    infoGroup.alignChildren = ["fill", "top"];
    infoGroup.add("statictext", undefined, "画像数: " + imageItems.length + "個");
    
    // ボタン
    var btnGroup = dialog.add("group");
    btnGroup.orientation = "row";
    btnGroup.alignment = ["right", "top"];
    var okBtn = btnGroup.add("button", undefined, "OK", {name: "ok"});
    var cancelBtn = btnGroup.add("button", undefined, "キャンセル", {name: "cancel"});
    
    if (dialog.show() == 2) {
        return; // キャンセル
    }
    
    var resolution = parseInt(resInput.text);
    if (isNaN(resolution) || resolution <= 0) {
        alert("正しい解像度を入力してください。");
        return;
    }
    
    var colorMode = colorDropdown.selection.text; // "RGB" または "CMYK"
    
    // 保存先フォルダの選択
    var docPath = doc.path;
    var saveFolder = Folder.selectDialog("PSDファイルの保存先フォルダを選択してください", docPath);
    
    if (!saveFolder) {
        return; // キャンセル
    }
    
    var successCount = 0;
    var failCount = 0;
    var errorMessages = [];
    
    // 各画像を処理
    for (var i = 0; i < imageItems.length; i++) {
        try {
            var imageObj = imageItems[i];
            var item = imageObj.item;
            
            // ファイル名の取得
            var itemName = "";
            
            // 方法1: すべてのリンクをループしてマッチするものを探す
            try {
                for (var k = 0; k < doc.links.length; k++) {
                    var link = doc.links[k];
                    
                    // リンクの名前を取得（これがリンクパネルに表示される名前）
                    var linkName = link.name;
                    
                    // リンクが指すオブジェクトの位置情報で照合
                    try {
                        // リンクに関連付けられたpageItemを確認
                        var linkParent = link.parent;
                        if (linkParent === item) {
                            itemName = linkName.replace(/\.[^\.]+$/, "");
                            break;
                        }
                    } catch (e) {
                        // parent取得に失敗した場合、名前で推測
                        // リンク名にアイテム名が含まれているか確認
                        if (item.name && linkName.indexOf(item.name) !== -1) {
                            itemName = linkName.replace(/\.[^\.]+$/, "");
                            break;
                        }
                    }
                }
            } catch (e) {}
            
            // 方法2: doc.linksを逆順で確認（最近追加されたものから）
            if (itemName === "") {
                try {
                    // 画像の数だけリンクがある場合、インデックスで対応付け
                    if (i < doc.links.length) {
                        var possibleLink = doc.links[i];
                        var possibleName = possibleLink.name;
                        if (possibleName && possibleName !== "") {
                            itemName = possibleName.replace(/\.[^\.]+$/, "");
                        }
                    }
                } catch (e) {}
            }
            
            // 方法3: PlacedItemのファイル情報から取得
            if (itemName === "" && imageObj.type === "placed") {
                try {
                    if (item.file) {
                        itemName = decodeURI(item.file.name).replace(/\.[^\.]+$/, "");
                    }
                } catch (e) {}
            }
            
            // 方法4: アイテム名を使用（自動生成名でない場合）
            if (itemName === "" && item.name && item.name !== "" && item.name.indexOf("<") === -1 && item.name.indexOf("画像") === -1 && item.name.indexOf("Image") === -1) {
                itemName = item.name;
            }
            
            // デフォルト名
            if (itemName === "") {
                itemName = "image_" + (i + 1);
            }
            
            // ファイル名の不正な文字を削除
            itemName = itemName.replace(/[\/\\:*?"<>|]/g, "_");
            itemName = itemName.replace(/^\s+|\s+$/g, ""); // 前後の空白削除
            
            // 同名ファイルが存在する場合は連番を追加
            var psdFileName = itemName + ".psd";
            var psdFile = new File(saveFolder + "/" + psdFileName);
            var counter = 1;
            while (psdFile.exists) {
                psdFileName = itemName + "_" + counter + ".psd";
                psdFile = new File(saveFolder + "/" + psdFileName);
                counter++;
            }
            
            // 位置とサイズの情報を保存
            var itemBounds = item.geometricBounds;
            var itemWidth = itemBounds[2] - itemBounds[0];
            var itemHeight = itemBounds[1] - itemBounds[3];
            var itemLeft = itemBounds[0];
            var itemTop = itemBounds[1];
            var itemRotation = item.rotation;
            var itemOpacity = item.opacity;
            
            // 親レイヤーとグループを保存
            var parentLayer = item.layer;
            var parentGroup = null;
            
            // クリッピングマスクの情報を保存
            var hasClippingMask = false;
            var clippingGroup = null;
            var itemIndexInGroup = -1;
            
            // 直接の親がGroupItemかどうか確認
            try {
                if (item.parent && item.parent.typename === "GroupItem") {
                    parentGroup = item.parent;
                    
                    // このグループがクリッピングマスクを持っているか確認
                    if (parentGroup.clipped) {
                        hasClippingMask = true;
                        clippingGroup = parentGroup;
                        
                        // グループ内での位置を記録
                        for (var j = 0; j < parentGroup.pageItems.length; j++) {
                            if (parentGroup.pageItems[j] === item) {
                                itemIndexInGroup = j;
                                break;
                            }
                        }
                    }
                }
            } catch (e) {
                // エラーが発生した場合は通常配置にフォールバック
            }
            
            // 画像を選択
            doc.selection = null;
            item.selected = true;
            
            // 一時ドキュメントを作成して書き出し
            var colorSpace = (colorMode === "CMYK") ? DocumentColorSpace.CMYK : DocumentColorSpace.RGB;
            var tempDoc = app.documents.add(colorSpace, Math.abs(itemWidth), Math.abs(itemHeight));
            var copiedItem = item.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);
            
            // 位置を調整（左上を原点に）
            var tempBounds = copiedItem.geometricBounds;
            copiedItem.left = copiedItem.left - tempBounds[0];
            copiedItem.top = copiedItem.top - tempBounds[3] + Math.abs(itemHeight);
            
            // PSDとして書き出し
            var exportOptions = new ExportOptionsPhotoshop();
            exportOptions.resolution = resolution;
            exportOptions.imageColorSpace = (colorMode === "CMYK") ? ImageColorSpace.CMYK : ImageColorSpace.RGB;
            exportOptions.embedICCProfile = true;
            exportOptions.antiAliasing = true;
            exportOptions.saveMultipleLayers = false;
            
            tempDoc.exportFile(psdFile, ExportType.PHOTOSHOP, exportOptions);
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            
            // 元の画像を削除する前に、再配置先を確定
            var targetContainer = hasClippingMask && clippingGroup ? clippingGroup : parentLayer;
            var insertIndex = itemIndexInGroup;
            
            // 元の画像を削除
            item.remove();
            
            // PSDファイルをリンクとして配置
            var linkedItem;
            
            if (hasClippingMask && clippingGroup) {
                // クリッピンググループ内に配置
                linkedItem = clippingGroup.placedItems.add();
                linkedItem.file = psdFile;
                linkedItem.left = itemLeft;
                linkedItem.top = itemTop;
                linkedItem.width = itemWidth;
                linkedItem.height = itemHeight;
                linkedItem.rotation = itemRotation;
                linkedItem.opacity = itemOpacity;
                linkedItem.name = itemName;
                
                // 元の位置に移動
                try {
                    if (insertIndex > 0 && insertIndex <= clippingGroup.pageItems.length) {
                        linkedItem.move(clippingGroup.pageItems[insertIndex - 1], ElementPlacement.PLACEAFTER);
                    }
                } catch (e) {
                    // 移動に失敗した場合はそのまま
                }
            } else if (parentGroup && !hasClippingMask) {
                // クリッピングマスクはないが、グループには属している場合
                linkedItem = parentGroup.placedItems.add();
                linkedItem.file = psdFile;
                linkedItem.left = itemLeft;
                linkedItem.top = itemTop;
                linkedItem.width = itemWidth;
                linkedItem.height = itemHeight;
                linkedItem.rotation = itemRotation;
                linkedItem.opacity = itemOpacity;
                linkedItem.name = itemName;
            } else {
                // 通常の配置（レイヤー直下）
                linkedItem = parentLayer.placedItems.add();
                linkedItem.file = psdFile;
                linkedItem.left = itemLeft;
                linkedItem.top = itemTop;
                linkedItem.width = itemWidth;
                linkedItem.height = itemHeight;
                linkedItem.rotation = itemRotation;
                linkedItem.opacity = itemOpacity;
                linkedItem.name = itemName;
            }
            
            successCount++;
            
        } catch (e) {
            failCount++;
            errorMessages.push("画像 " + (i + 1) + ": " + e.message);
        }
    }
    
    // 結果レポート
    var resultDialog = new Window("dialog", "処理完了");
    resultDialog.orientation = "column";
    resultDialog.alignChildren = ["fill", "top"];
    resultDialog.spacing = 10;
    resultDialog.margins = 16;
    
    var resultPanel = resultDialog.add("panel", undefined, "処理結果");
    resultPanel.alignChildren = ["left", "top"];
    resultPanel.spacing = 5;
    resultPanel.margins = 10;
    
    resultPanel.add("statictext", undefined, "処理対象: " + imageItems.length + "個");
    resultPanel.add("statictext", undefined, "成功: " + successCount + "個");
    resultPanel.add("statictext", undefined, "失敗: " + failCount + "個");
    resultPanel.add("statictext", undefined, "保存先: " + saveFolder.fsName);
    resultPanel.add("statictext", undefined, "解像度: " + resolution + " dpi");
    resultPanel.add("statictext", undefined, "カラーモード: " + colorMode);
    
    if (errorMessages.length > 0) {
        var errorPanel = resultDialog.add("panel", undefined, "エラー詳細");
        errorPanel.alignChildren = ["fill", "top"];
        errorPanel.spacing = 5;
        errorPanel.margins = 10;
        
        var errorText = errorPanel.add("edittext", undefined, errorMessages.join("\n"), {multiline: true, scrolling: true});
        errorText.size = [400, 100];
    }
    
    var closeBtn = resultDialog.add("button", undefined, "閉じる", {name: "ok"});
    
    resultDialog.show();
    
})();