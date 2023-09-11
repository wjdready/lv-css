const cssom = require('cssom');
const fs = require('fs');
const CssSelectorParser = require('css-selector-parser');
const polished = require('polished');
const yargs = require('yargs');

const lvPartTable = {
    "main": "LV_PART_MAIN",
    "scrollbar": "LV_PART_SCROLLBAR",
    "indicator": "LV_PART_INDICATOR",
    "knob": "LV_PART_KNOB",
    "selected": "LV_PART_SELECTED",
    "items": "LV_PART_ITEMS",
    "ticks": "LV_PART_TICKS",
    "cursor": "LV_PART_CURSOR",
    "custom_first": "LV_PART_CUSTOM_FIRST",
    "any": "LV_PART_ANY"
};

const lvStateTable = {
    "default": "LV_STATE_DEFAULT",
    "focused": "LV_STATE_FOCUSED",
    "checked": "LV_STATE_CHECKED",
    "focused_key": "LV_STATE_FOCUS_KEY",
    "edited": "LV_STATE_EDITED",
    "hovered": "LV_STATE_HOVERED",
    "pressed": "LV_STATE_PRESSED",
    "scrolled": "LV_STATE_SCROLLED",
    "disabled": "LV_STATE_DISABLED",
    "user_1": "LV_STATE_USER_1",
    "user_2": "LV_STATE_USER_2",
    "user_3": "LV_STATE_USER_3",
    "user_4": "LV_STATE_USER_4",
    "any": "LV_STATE_ANY"
};

/* Color conversion */
function colorConverCommonFunc(colorConverStr, opaConverStr, colorValue) {

    let color;
    try {
        color = polished.parseToRgb(colorValue);
    } catch (error) {
        return null;
    }

    let cstr = "    " + colorConverStr + "(this, ";
    cstr += "lv_color_make(" + color.red + ", " + color.green + ", " + color.blue + "));\n";
    if (typeof color.alpha != 'undefined') {
        /* Convert opacity to LVGL format */
        color.alpha = Math.round(color.alpha * 255);
        cstr += "    " + opaConverStr + "(this, " + color.alpha + ");\n";
    }
    return cstr;
}

/* Size conversion */
function sizeConverCommonFunc(converStyleName, styleValue) {

    let cstr = "    " + converStyleName + "(this, ";

    if (styleValue == "auto") {
        cstr += "LV_SIZE_CONTENT));\n";
        return cstr;
    }

    const regex = /^(\d+)([a-zA-Z%]*)$/;
    const match = styleValue.match(regex);

    if (match == null) {
        return null;
    }

    if (typeof match[2] != 'undefined' && match[2] == '%') {
        cstr += "LV_PCT(" + match[1] + "));\n";
        return cstr;
    }

    cstr += match[1] + ");\n";
    return cstr;
}

/* Direct conversion */
function converCommonFunc(converStyleName, styleValue) {
    let cstr = "    " + converStyleName + "(this, ";
    cstr += styleValue + ");\n";
    return cstr;
}

const lvStyleTable = {
    "width": "lv_style_set_width",
    "min-width": "lv_style_set_min_width",
    "max-width": "lv_style_set_max_width",
    "height": "lv_style_set_height",
    "min-height": "lv_style_set_min_height",
    "max-height": "lv_style_set_max_height",
    "x": "lv_style_set_x",
    "y": "lv_style_set_y",
    "align": "lv_style_set_align",
    "transform-width": "lv_style_set_transform_width",
    "transform-height": "lv_style_set_transform_height",
    "translate-x": "lv_style_set_translate_x",
    "translate-y": "lv_style_set_translate_y",
    "transform-zoom": "lv_style_set_transform_zoom",
    "transform-angle": "lv_style_set_transform_angle",
    "transform-pivot-x": "lv_style_set_transform_pivot_x",
    "transform-pivot-y": "lv_style_set_transform_pivot_y",
    "padding-top": (styleValue) => {
        return sizeConverCommonFunc("lv_style_set_pad_top", styleValue);
    },
    "padding-bottom": (styleValue) => {
        return sizeConverCommonFunc("lv_style_set_pad_bottom", styleValue);
    },
    "padding-left": (styleValue) => {
        return sizeConverCommonFunc("lv_style_set_pad_left", styleValue);
    },
    "padding-right": (styleValue) => {
        return sizeConverCommonFunc("lv_style_set_pad_right", styleValue);
    },
    "padding": (styleValue) => {
        return sizeConverCommonFunc("lv_style_set_pad_all", styleValue);
    },
    "pad-row": "lv_style_set_pad_row",
    "pad-column": "lv_style_set_pad_column",
    "background-color": (styleValue) => {
        return colorConverCommonFunc("lv_style_set_bg_color", "lv_style_set_bg_opa", styleValue);
    },
    "bg-grad-color": "lv_style_set_bg_grad_color",
    "bg-grad-dir": "lv_style_set_bg_grad_dir",
    "bg-main-stop": "lv_style_set_bg_main_stop",
    "bg-grad-stop": "lv_style_set_bg_grad_stop",
    "bg-grad": "lv_style_set_bg_grad",
    "bg-dither-mode": "lv_style_set_bg_dither_mode",
    "bg-img-src": "lv_style_set_bg_img_src",
    "bg-img-opa": "lv_style_set_bg_img_opa",
    "bg-img-recolor": (styleValue) => {
        return colorConverCommonFunc("lv_style_set_bg_img_recolor", "lv_style_set_bg_img_recolor_opa", styleValue);
    },
    "bg-img-tiled": "lv_style_set_bg_img_tiled",
    "border-color": (styleValue) => {
        return colorConverCommonFunc("lv_style_set_border_color", "lv_style_set_border_opa", styleValue);
    },
    "border-width": (styleValue) => {
        return sizeConverCommonFunc("lv_style_set_border_width", styleValue);
    },
    "border-side": "lv_style_set_border_side",
    "border-post": "lv_style_set_border_post",
    "outline-width": (styleValue) => {
        return sizeConverCommonFunc("lv_style_set_outline_width", styleValue);
    },
    "outline-color": (styleValue) => {
        return colorConverCommonFunc("lv_style_set_outline_color", "lv_style_set_outline_opa", styleValue);
    },
    "outline-offset": (styleValue) => {
        return sizeConverCommonFunc("lv_style_set_outline_pad", styleValue);
    },
    "shadow-width": "lv_style_set_shadow_width",
    "shadow-ofs-x": "lv_style_set_shadow_ofs_x",
    "shadow-ofs-y": "lv_style_set_shadow_ofs_y",
    "shadow-spread": "lv_style_set_shadow_spread",
    "shadow-color": "lv_style_set_shadow_color",
    "shadow-opa": "lv_style_set_shadow_opa",
    "img-opa": "lv_style_set_img_opa",
    "img-recolor": "lv_style_set_img_recolor",
    "img-recolor-opa": "lv_style_set_img_recolor_opa",
    "line-width": "lv_style_set_line_width",
    "line-dash-width": "lv_style_set_line_dash_width",
    "line-dash-gap": "lv_style_set_line_dash_gap",
    "line-rounded": "lv_style_set_line_rounded",
    "line-color": "lv_style_set_line_color",
    "line-opa": "lv_style_set_line_opa",
    "arc-width": "lv_style_set_arc_width",
    "arc-rounded": "lv_style_set_arc_rounded",
    "arc-color": "lv_style_set_arc_color",
    "arc-opa": "lv_style_set_arc_opa",
    "arc-img-src": "lv_style_set_arc_img_src",
    "text-color": (styleValue) => {
        return colorConverCommonFunc("lv_style_set_text_color", "lv_style_set_text_opa", styleValue);
    },
    "text-opa": "lv_style_set_text_opa",
    "text-font": "lv_style_set_text_font",
    "text-letter-space": "lv_style_set_text_letter_space",
    "text-line-space": "lv_style_set_text_line_space",
    "text-decor": "lv_style_set_text_decor",
    "text-align": "lv_style_set_text_align",
    "radius": "lv_style_set_radius",
    "clip-corner": "lv_style_set_clip_corner",
    "opa": "lv_style_set_opa",
    "color-filter-dsc": "lv_style_set_color_filter_dsc",
    "color-filter-opa": "lv_style_set_color_filter_opa",
    "anim": "lv_style_set_anim",
    "anim-time": "lv_style_set_anim_time",
    "anim-speed": "lv_style_set_anim_speed",
    "transition": "lv_style_set_transition",
    "blend-mode": "lv_style_set_blend_mode",
    "layout": "lv_style_set_layout",
    "base-dir": "lv_style_set_base_dir",
    "flex-flow": "lv_style_set_flex_flow",
    "flex-main-place": "lv_style_set_flex_main_place",
    "flex-cross-place": "lv_style_set_flex_cross_place",
    "flex-track-place": "lv_style_set_flex_track_place",
    "pad-hor": "lv_style_set_pad_hor",
    "pad-ver": "lv_style_set_pad_ver",
    "size": "lv_style_set_size",
};

function createHead(tagCollect, theme) {

    let cstr = '';

    cstr += "/* Generated by lv-css, do not modify */\n\n";
    cstr += '#include "ui_theme.h"\n\n';
    cstr += 'static void apply_cb(lv_theme_t *th, lv_obj_t *obj)\n';
    cstr += '{\n';

    if (tagCollect.length > 0) {
        let tag = tagCollect[0];
        cstr += '    if (lv_obj_check_type(obj, &' + tag + '_class))\n';
        cstr += '        UI_STYLE_APPLY(obj, ' + tag + ');\n';
    }

    for (let i = 1; i < tagCollect.length; i++) {
        let tag = tagCollect[i];
        cstr += '    else if (lv_obj_check_type(obj, &' + tag + '_class))\n';
        cstr += '        UI_STYLE_APPLY(obj, ' + tag + ');\n';
    }

    cstr += '}\n\n';

    cstr += 'lv_theme_apply_cb_t ui_theme_' + theme + '_get_cb(void)\n';
    cstr += '{\n';
    cstr += '    return apply_cb;\n';
    cstr += '}\n\n';

    return cstr;
}

function convert(cssResult, tagCollect, theme) {

    let cstr = createHead(tagCollect, theme);

    let index = 0;
    for (let item in cssResult) {

        let arr = item.split(':');

        if (arr.length != 3)
            continue;

        let styleName = arr[0];
        let part = arr[1];
        let states = arr[2].split("|");

        /* Check whether part exists in lvPartTable */
        if (typeof lvPartTable[part] == 'undefined') {
            console.log("'" + part + "'" + " will conver to " + "LV_PART_" + part.toUpperCase() +
                ", but it's not a LVGL part");
            continue;
        }

        /* Check every state */
        let notok = 0;
        for (let state of states) {
            if (typeof lvStateTable[state] == 'undefined') {
                console.log("'" + state + "'" + " will conver to " + "LV_STATE_" + state.toUpperCase() +
                    ", but it's not a LVGL state");
                notok++;
            }
        }
        if (notok)
            continue;

        /* Conver to LVGL style */

        let selectorMacroName = "SELECTOR" + index.toString();

        // Example: #define SELECTOR0 LV_PART_MAIN | LV_STATE_FOCUSED | LV_STATE_PRESSED
        let selectorMacro = "#define " + selectorMacroName + " " + lvPartTable[part];
        for (let state of states)
            selectorMacro += " | " + lvStateTable[state];

        cstr += selectorMacro + "\n";
        cstr += "UI_STYLE_DEF(" + styleName + ", " + "UI_THEME_" + theme.toUpperCase() + ', ' + selectorMacroName + ", {\n";

        /* For ecach style */
        for (let styleItem in cssResult[item]) {

            let styleValue = cssResult[item][styleItem];

            if (typeof lvStyleTable[styleItem] == 'undefined') {
                console.log("Can not find the style '" + styleItem + "' in the table");
                cstr += "    /* " + styleItem + ": " + styleValue + ", conver function undefined! */\n";
                continue;
            }

            /* The string type is used directly */
            else if (typeof lvStyleTable[styleItem] == 'string') {
                cstr += "    " + lvStyleTable[styleItem] + "(this, " + styleValue + ");\n"
                continue;
            }

            let converFunc = lvStyleTable[styleItem];
            let converReseult = converFunc(styleValue);
            if (converReseult == null) {
                console.log(styleItem + ": " + styleValue + " conver failed!");
                cstr += "    /* " + styleItem + ": " + styleValue + ", conver failed! */\n";
                continue;
            }
            cstr += converReseult;
        }

        cstr += "});\n\n";
        index++;
    }

    return cstr;
}

/* Handle css selector strings */
function handleSelector(selectorText, cssAttr, cssResult, tagCollect) {

    /* Create a parser */
    const cssSelectorParser = CssSelectorParser.createParser();

    /* Parse the selector */
    let selector;
    try {
        selector = cssSelectorParser(selectorText);
    } catch (error) {
        console.error(error.message);
        return;
    }

    /* For each rule parsed */
    for (let rule of selector.rules) {
        if (rule.type != 'Rule') {
            console.log('not a rule');
            continue;
        }

        let name = "";
        let part = "main";
        let state = "default";

        /* If there are custom attributes */
        if (typeof rule.attributes != 'undefined') {
            for (let a of rule.attributes) {
                part = a.name == 'part' ? a.value.value : part;
                state = a.name == 'state' ? state + "|" + a.value.value : state;
            }
        }

        /* It's a tag, Example: lv_btn */
        if (typeof rule.tag != 'undefined') {

            if (rule.tag.type == 'TagName') {
                /* Not in tagCollect, we collect it */
                if (!tagCollect.includes(rule.tag.name))
                    tagCollect.push(rule.tag.name);
                name = rule.tag.name;
            }

            else if (rule.tag.type == 'WildcardTag')
                name = "*";
        }

        /* It's a className, Example: .mybtn */
        else if (typeof rule.classNames != 'undefined')
            name = rule.classNames[0];

        /* Example: mybtn:main:default|focused|pressed */
        name = name + ":" + part + ":" + state;

        /* Remove spaces */
        name = name.replace(/\s/g, "");

        if (!cssResult.hasOwnProperty(name)) {
            cssResult[name] = {};
        }

        for (let attr of cssAttr) {
            cssResult[name][attr.attrName] = attr.attrValue;
        }
    }
}

function main() {

    /* Define command line */
    yargs.usage('Usage: $0 <input CSS file> -o <output file> -t <theme name>');
    yargs.option('outfile', {
        alias: 'o',
        type: 'string',
        nargs: 1,
        demandOption: "Must specify output file",
        description: 'File to write',
    });
    yargs.option('theme', {
        alias: 't',
        type: 'string',
        nargs: 1,
        description: 'Theme name',
    });
    yargs.demandCommand(1, "Must specify input file");

    let cssfile = yargs.argv._[0];
    let outfile = yargs.argv.outfile;
    let theme = yargs.argv.theme ? yargs.argv.theme : "default";

    let css_data;
    try {
        css_data = fs.readFileSync(cssfile, 'utf8');
    } catch (error) {
        console.error(error.message);
        return;
    }

    /* Parse the css string */
    const css = cssom.parse(css_data);

    let cssResult = {};
    let tagCollect = [];

    /* For each css rule */
    for (let rule of css.cssRules) {

        let cssAttr = [];

        /* Get the properties of each rule */
        for (let i = 0; i < rule.style.length; i++) {

            let attrName = rule.style[i.toString()];
            let attrValue = rule.style.getPropertyValue(attrName);
            cssAttr.push({ "attrName": attrName, "attrValue": attrValue });
        }

        handleSelector(rule.selectorText, cssAttr, cssResult, tagCollect);
    }

    // console.log(cssResult);

    let cstr = convert(cssResult, tagCollect, theme);

    fs.writeFileSync(outfile, cstr);
}

main()
