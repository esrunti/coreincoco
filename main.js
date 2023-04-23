const input_table_title = ["check", "name", "width", "max_num", "min_num", "price"];
let frame_max_length = -1;
let frame_min_length = -1;

//全体サイズの登録
//TODO 画面に反映させる
function submit_setting() {
    frame_max_length = number_check(target_data.target_max_length.value, "入れたいものの値をチェックしてください");
    frame_min_length = number_check(target_data.target_min_length.value, "入れたいものの値をチェックしてください");
    document.getElementById("outer-setting").textContent = `設定値：${frame_min_length} ~ ${frame_max_length}`;
    //最大最小への反映
    let table_body = document.getElementById("input_table_body");
    for (let i = 0; i < table_body.rows.length; i++) {
        let box_size = table_body.rows[i].cells[2].innerText;
        if (table_body.rows[i].cells[3].textContent.indexOf("(") != -1) {
            table_body.rows[i].cells[3].textContent = "(" + Math.floor(frame_max_length / box_size) + ")";
        }
    }

}

function number_check(str, err_msg = "val_check") {
    str = str.trim();
    if (!isNaN(str) && str !== "") {
        let val = Number(str);
        if (val >= 0) {
            return val;
        } else {
            alert(err_msg);
            return -1;
        }
    } else {
        alert(err_msg);
        return -1;
    }
}



//入力データをテーブルに登録
function resist_input_data() {
    const data = document.forms.box_data;

    //品名or幅が空欄の場合、アラートを出す。
    if (data.box_name.value == "" || data.box_width.value == "") {
        alert("入れたいものの値をチェックして下さい");
        return;
    }
    if (frame_max_length < frame_min_length) {
        alert("入れたい場所の値をチェックして下さい");
        return;
    }
    if (data.box_max_num.value != "" && data.box_min_num.value != "") {
        if (data.box_max_num.value < data.box_min_num.value) {
            alert("入れたいものの最大値、最小値をチェックして下さい");
            return;
        }
    }

    //テーブルの準備
    const table_tbody = document.getElementById("input_table_body");
    const data_row = document.createElement("tr");

    //1列目にチェックボックス を設定
    const d0 = document.createElement("td");
    data_row.appendChild(d0);
    const d_input = document.createElement("input");
    d0.appendChild(d_input);
    d_input.setAttribute("type", "checkbox");
    d_input.setAttribute("checked", "checked");
    d_input.className = "table_box_check";

    //テキストボックスと全て有効に変更。
    Array.from(document.getElementsByClassName("box_data_input")).forEach(value => {
        value.disabled = false;
    })

    //formからループでデータをテーブルにコピー。
    const formData = new FormData(document.forms[1]);
    const formArray = Array.from(formData);
    let flag = true;//trueになると行を追加する
    formArray.forEach((value, index) => {
        let td = document.createElement("td");
        data_row.appendChild(td);
        let ret;
        switch (index) {
            case 1:
                ret = number_check(value[1]);
                if (ret == -1) {
                    flag = false;
                }
                break;
            case 2:
                if (value[1] == "") {
                    ret = "(" + Math.floor(frame_max_length / data.box_width.value) + ")";
                } else {
                    ret = value[1];
                }
                break;
            case 3:
            case 4:
                if (value[1] == "") {
                    ret = "(0)";
                } else {
                    ret = value[1];
                }
                break;
            default:
                ret = value[1];
                break;
        }
        td.textContent = ret;
        td.className = "table" + value[0];
    });

    let td = document.createElement("td");
    data_row.appendChild(td);
    let del_btn = document.createElement("input");
    td.appendChild(del_btn);
    del_btn.setAttribute("type", "button");
    del_btn.setAttribute("value", "del");
    del_btn.setAttribute("onclick", "del_box_row(this)");
    del_btn.setAttribute("class", "btn-origin");

    if (flag) {
        table_tbody.appendChild(data_row);
    }

    //チェックボックスを全て有効に変更。
    Array.from(document.getElementsByClassName("box_data_check")).forEach(value => {
        value.disabled = false;
    })
    Array.from(document.getElementsByClassName("box_data_input")).forEach(value => {
        value.disabled = true;
    })
    //入力フォームをリセット
    data.reset();
    //品名のテキストボックスを入力モードにする。
    data.box_name.focus();
}

//チェックボックスの値の変更を入力の可不可に反映させる
function num_checkbox_changed(checkbox_obj) {
    let index = Array.prototype.indexOf.call(document.getElementsByClassName("box_data_check"), checkbox_obj);
    let num_box = document.getElementsByClassName("box_data_input")[index];
    num_box.disabled = !checkbox_obj.checked;
    if (checkbox_obj.checked) {
        num_box.focus();
    }
}

function del_box_row(btn) {
    let btn_row = btn.parentNode.parentNode;
    btn_row.parentNode.removeChild(btn_row);
}

//TODO パターンの計算
//TODO calc_patternとcalcの統合
//TODO minとmaxの反映
function disp_result() {
    let base_table = make_table();
    let table_length = base_table["name"].length;

    let result_table = [];
    calc_pattern(Array(table_length).fill(0), base_table["width"], base_table["max-val"], base_table["min-val"], 0, result_table);
    result_table.sort(function (a, b) {
        return multipleArray(base_table["width"], b) - multipleArray(base_table["width"], a);
    })

    if (result_table.length == 0) {
        alert("表示できる組み合わせがありません。");
        return;
    } else {
        display_visual_boxes(base_table, result_table);
        display_visual_cards(base_table, result_table);
    }


}

function display_visual_boxes(base_table, result_table) {
    let table_body = document.getElementById("box_table");
    table_body.innerHTML = "";
    let top_width = document.getElementById("result-table-area").offsetWidth;
    let start_color = document.getElementById("start-color").value;
    let end_color = document.getElementById("end-color").value;
    let color_list = color_step(start_color, end_color, result_table[0].length);
    color_list = reorder_color(color_list);

    for (let i = 0; i < result_table.length; i++) {
        let row = document.createElement("tr");
        table_body.appendChild(row);
        let link_area = document.createElement("td");
        row.appendChild(link_area);
        let link_a = document.createElement("a");
        link_area.appendChild(link_a);
        link_a.href = `#cards${i.toString().padStart(3, "0")}`;
        let link_div = document.createElement("div");
        link_a.appendChild(link_div);
        link_div.textContent = multipleArray(result_table[i], base_table["width"]);
        let box_area = document.createElement("td");
        box_area.setAttribute("style", `height:${link_area.offsetHeight}px`);
        box_area.setAttribute("class", "box-parent");
        row.appendChild(box_area);
        for (let j = 0; j < result_table[i].length; j++) {
            for (let k = 0; k < result_table[i][j]; k++) {
                let box_div = document.createElement("div");
                box_area.appendChild(box_div);
                box_div.setAttribute("class", "box");
                let box_width = top_width * 0.7 * base_table["width"][j] / frame_max_length;
                box_div.setAttribute("style", `width:${box_width}px; background-color:${color_list[j]};`);
            }
        }
    }
}

function del_card() {
    let card_area = document.getElementById("card_area");
    while (card_area.firstChild) {
        card_area.removeChild(card_area.firstChild);
    }
}

function display_visual_cards(base_table, result_table) {
    del_card();

    result_table.forEach(function (value, index) {
        let total_width = multipleArray(value, base_table["width"]);
        let total_price = multipleArray(value, base_table["price"]);
        let box_menu = [];
        /*         value.forEach(function (value, index) {
                    box_menu.push(base_table["name"][index] + "(" + base_table["width"][index] + ")" + " X " + value);
                }) */
        value.forEach(function (value, index) {
            if (value > 0) {
                box_menu.push(base_table["name"][index] + "(" + base_table["width"][index] + ")" + " X " + value);
            }
        })
        add_card(total_width, box_menu, total_price, index);
    })
}

function add_card(title, box_list, footer, index) {
    let card_area = document.getElementById("card_area")
    let d1 = document.createElement("div");
    d1.setAttribute("class", `col-md-6`);
    d1.setAttribute("id", `cards${index.toString().padStart(3, "0")}`);
    card_area.appendChild(d1);
    let d2 = document.createElement("div");
    d2.setAttribute("class", "card my-2");
    d1.appendChild(d2);
    let header_area = document.createElement("div");
    header_area.setAttribute("class", "card-header");
    header_area.textContent = title;
    d2.appendChild(header_area);
    let list_area = document.createElement("ol");
    list_area.setAttribute("class", "list-group list-group-flush");
    d2.appendChild(list_area);
    box_list.forEach(function (value) {
        let list_text = document.createElement("li");
        list_text.setAttribute("class", "list-group-item");
        list_text.textContent = value;
        list_area.appendChild(list_text);
    })
    let footer_area = document.createElement("div");
    footer_area.setAttribute("class", "card-footer");
    footer_area.textContent = footer;
    d2.appendChild(footer_area);
}

//tableからpattern用のデータを作成
function make_table() {
    const input_table = document.getElementById("input_table");
    const input_data = {};
    const result_key = ["name", "width", "max-val", "min-val", "price"];
    for (let i = 0; i < result_key.length; i++) {
        input_data[result_key[i]] = [];
    }

    for (let i = 1; i < input_table.rows.length; i++) {
        const row_table = input_table.rows[i];
        if (row_table.querySelector("input").checked) {
            for (let j = 0; j < result_key.length; j++) {
                let key = result_key[j];
                let val = row_table.cells[j + 1].textContent;
                input_data[key].push(conv_char(val));
            }
        }
    }
    return input_data;
}

function conv_char(str) {
    str = str.replace("(", "").replace(")", "");
    str = isNaN(str) ? str : parseFloat(str);
    return str;
}

//パターン計算のための再帰関数
function calc_pattern(calc_arr, width_arr, max_num_arr, min_num_arr, index, result) {
    if (width_arr.length == index) {
        let total_width = multipleArray(calc_arr, width_arr);
        if (frame_min_length <= total_width && 0 < total_width) {
            result.push(calc_arr);
        }
    } else {
        let min_num = min_num_arr[index];
        let max_num = Math.min(max_num_arr[index], Math.floor((frame_max_length - multipleArray(calc_arr, width_arr)) / width_arr[index]));
        if (min_num <= max_num) {
            for (let i = min_num; i <= max_num; i++) {
                let calc_arr_ = [...calc_arr];
                calc_arr_[index] = i;
                calc_pattern(calc_arr_, width_arr, max_num_arr, min_num_arr, index + 1, result);
            }
        } else {
            return;
        }
    }
}

//a1x1+a2x2+a3x3+...
function multipleArray(arr1, arr2) {
    let ret = 0;

    for (let i = 0; i < arr1.length; i++) {
        let n1 = Math.max(
            (arr1[i].toString().split(".")[1] || "").length,
            (arr2[i].toString().split(".")[1] || "").length
        );
        let p1 = parseInt((arr1[i] * 10 ** n1).toFixed(0));
        let p2 = parseInt((arr2[i] * 10 ** n1).toFixed(0));
        let product = parseFloat(((p1 * p2) / 100 ** n1).toFixed(n1));

        let n2 = Math.max(
            (product.toString().split(".")[1] || "").length,
            (ret.toString().split(".")[1] || "").length
        );
        let int_product = parseInt((product * 10 ** n2).toFixed(0));
        let int_ret = parseInt((ret * 10 ** n2).toFixed(0));
        ret = parseFloat(((int_product + int_ret) / 10 ** n2).toFixed(n2));
    }
    return ret;
}

function get_column_int_data(table, col_num) {
    let ret = [];
    for (let i = 0; i < table.length; i++) {
        ret.push(parseInt(table[i][col_num].replace("(", "").replace(")", "")));
    }
    return ret;
}

function get_column_str_data(table, col_num) {
    let ret = [];
    for (let i = 0; i < table.length; i++) {
        ret.push(table[i][col_num]);
    }
    return ret;
}

function color_step(color1, color2, color_num) {
    let arr_color = [];
    let hsl_start = (rgb2hsl(hex2rgb(color1)));
    let hsl_end = (rgb2hsl(hex2rgb(color2)));
    //a<b
    let [hs, ss, ls] = hsl_start;
    let [he, se, le] = hsl_end;
    if (color_num == 1) {
        arr_color.push(rgb2hex(hsl2rgb([hs, ss, ls])));
    } else if (color_num == 2) {
        arr_color.push(rgb2hex(hsl2rgb([hs, ss, ls])));
        arr_color.push(rgb2hex(hsl2rgb([he, se, le])));
    } else {
        let h_step = Math.abs(he - hs) <= 180 ? (he - hs) / (color_num - 1) : (he - hs - 360) / (color_num - 1);
        let s_step = (se - ss) / (color_num - 1);
        let l_step = (le - ls) / (color_num - 1);
        for (let i = 0; i < color_num; i++) {
            let hx = hs + h_step * i;
            hx = hx < 0 ? hx + 360 : hx;
            let sx = ss + s_step * i;
            let lx = ls + l_step * i;
            console.log(hx, sx, lx);
            arr_color.push(rgb2hex(hsl2rgb([hx, sx, lx])));
        }
    }
    return arr_color;

    function hex2rgb(hexColor) {
        hexColor = hexColor.replace("#", "");
        if (hexColor.length === 3) {
            hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2];
        }
        let r = parseInt(hexColor.substring(0, 2), 16);
        let g = parseInt(hexColor.substring(2, 4), 16);
        let b = parseInt(hexColor.substring(4, 6), 16);
        return [r, g, b];
    }

    function rgb2hsl(RGB255) {
        let r = RGB255[0] / 255;
        let g = RGB255[1] / 255;
        let b = RGB255[2] / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);

        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = 0;
            s = 0;
        } else {
            let diff = max - min;
            s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / diff + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / diff + 2;
                    break;
                case b:
                    h = (r - g) / diff + 4;
                    break;
            }
            h /= 6
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    function hsl2rgb(hsl) {
        let h = hsl[0] / 360;
        let s = hsl[1] / 100;
        let l = hsl[2] / 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];

        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
    }

    function rgb2hex(RGB255) {
        return "#" + RGB255.map(c => {
            let hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

}

function get_select_radiobtn(groupname) {
    let options = document.getElementsByName(groupname);
    let select_value;
    for (let i = 0; i < options.length; i++) {
        if (options[i].checked) {
            select_value = options[i].value;
            break;
        }
    }
    console.log(select_value);
    return select_value;
}

function reorder_color(color_arr) {
    switch (get_select_radiobtn("color-order")) {
        case "balance-order":
            color_arr = sort_color_by_maxdiff(color_arr);
            break;
        case "random-order":
            color_arr = sort_color_by_random(color_arr);
            break;
        default:
            break;
    }
    return color_arr;
}

function sort_color_by_maxdiff(color_arr) {
    let evennum = color_arr.filter((_, index) => index % 2 !== 0);
    let oddnum = color_arr.filter((_, index) => index % 2 === 0);
    let ret = oddnum.concat(evennum);
    return ret;
}

function sort_color_by_random(color_arr) {
    let len = color_arr.length;
    for (i = 0; i < 100; i++) {
        let r1 = Math.floor(Math.random() * (len));
        let r2 = Math.floor(Math.random() * (len));
        let tmp = color_arr[r1];
        color_arr[r1] = color_arr[r2];
        color_arr[r2] = tmp;
    }
    return color_arr;
}



//TODO 結果表示














