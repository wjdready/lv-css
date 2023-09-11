

This is a library that converts CSS to LVGL style.

#### Examples of use:

Clone the code and execute

```sh
cd lv-css
npm install
node main.js example.css -o ui_theme_default.c -t default
```

It will generate `ui_theme_default.c`, which needs to be used with `ui_ theme.c` and `ui_ theme.h`. For example:

example.css

```css
lv_btn, .mybtn {
    background-color: red;
    border-width: 2;
    border-color: black;
    outline-width: 0;
    outline-color: blueviolet;
    width: 50;
    height: 20;
}

lv_btn[state = pressed] {
    outline-width: 5;
    width: 55;
    height: 25;
}

.mybtn {
    background-color: gray;
}

.mybtn[state = focused] {
    background-color: blue;
    outline-color: green;
}
```

>The default is LV_PART_MAIN and LV_STATE_DEFAULT, and if not, you need to specify.
>for example:
>
>```css
>.myclass[part = items][state = "focused | pressed"] {
>    background-color: red;
>}
>```

main.c

```c
#include "lvgl.h"
#include "ui_theme.h"

void main()
{
    lv_init();
    lv_port_disp_init();
    lv_port_indev_init();
    
    // Initialize our theme function
    ui_theme_init();

    // Use the lv_btn element
    lv_obj_t * btn1 = lv_btn_create(lv_scr_act());
    lv_obj_align(btn1, LV_ALIGN_CENTER, 0, -40);

    // Specify the style class to use.
    lv_obj_t * btn2 = lv_btn_create(lv_scr_act());
    lv_obj_align(btn2, LV_ALIGN_CENTER, 0, 40);
    UI_STYLE_APPLY(btn2, mybtn);

    while(1)
    {
        lv_timer_handler();
        usleep(5 * 1000);
    }
}
```

#### More

More conversion rules are not careful replacement, But you can use the LVGL format directly:

```css
.myclass {
    flex-flow: LV_FLEX_FLOW_COLUMN;
    flex-main-place: LV_FLEX_ALIGN_SPACE_BETWEEN;
    flex-cross-place: LV_FLEX_ALIGN_CENTER;
    flex-track-place: LV_FLEX_ALIGN_START;
    width: LV_PCT(100);                 /* Fill the parent page 100% */
    size: LV_SIZE_CONTENT;              /* Size auto */
    text-font: &ui_font_source_han;     /* Set font */
}
```
It will generate:

```c
#define SELECTOR0 LV_PART_MAIN | LV_STATE_DEFAULT
UI_STYLE_DEF(myclass, UI_THEME_DEFAULT, SELECTOR0, {
    lv_style_set_flex_flow(this, LV_FLEX_FLOW_COLUMN);
    lv_style_set_flex_main_place(this, LV_FLEX_ALIGN_SPACE_BETWEEN);
    lv_style_set_flex_cross_place(this, LV_FLEX_ALIGN_CENTER);
    lv_style_set_flex_track_place(this, LV_FLEX_ALIGN_START);
    lv_style_set_width(this, LV_PCT(100));
    lv_style_set_size(this, LV_SIZE_CONTENT);
    lv_style_set_text_font(this, &ui_font_source_han);
});
```

##### All

All the implementations are listed below

```
{
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
}
```
