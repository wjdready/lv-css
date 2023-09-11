#ifndef __UI_THEME_H__
#define __UI_THEME_H__

#include "lvgl.h"

typedef enum
{
    UI_THEME_DEFAULT,
    _UI_HEME_MAX,
} ui_theme_type_t;

typedef struct
{
    lv_style_t *style;
    void (*init_cb)(lv_style_t *style);
    lv_style_selector_t selector;
} ui_obj_style_t;

/* Style definition */
#define UI_STYLE_DEF(name, theme, state, ...)                                                                          \
    static lv_style_t _style_##name##state##theme;                                                                     \
    static void _style_##name##state##theme##_init(lv_style_t *this)                                                   \
    {                                                                                                                  \
        __VA_ARGS__                                                                                                    \
    }                                                                                                                  \
    static const ui_obj_style_t _style_##name##state##theme##_struct = {                                               \
        .style = &_style_##name##state##theme, .init_cb = _style_##name##state##theme##_init, .selector = state};      \
    static const __attribute__((used, section("style_section_" #name #theme)))                                         \
    ui_obj_style_t *_style_##name##state##theme##_p = &(_style_##name##state##theme##_struct);                         \
    static const __attribute__((used, section("all_style_section")))                                                   \
    ui_obj_style_t *_style_##name##state##theme##_p2 = &(_style_##name##state##theme##_struct);

/* Apply styles, specify theme */
#ifdef __ARMCC_VERSION /* ARM C Compiler */
#define UI_STYLE_APPLY_WITH_THEME(obj, name, theme)                                                                    \
    {                                                                                                                  \
        extern __attribute__((weak)) ui_obj_style_t *style_section_##name##theme##$$Base;                              \
        extern __attribute__((weak)) ui_obj_style_t *style_section_##name##theme##$$Limit;                             \
        for (ui_obj_style_t **item = &(style_section_##name##theme##$$Base);                                           \
             item != &(style_section_##name##theme##$$Limit); item++)                                                  \
            lv_obj_add_style(obj, (*item)->style, (*item)->selector);                                                  \
    }
#elif defined(__GNUC__)
#define UI_STYLE_APPLY_WITH_THEME(obj, name, theme)                                                                    \
    {                                                                                                                  \
        extern __attribute__((weak)) ui_obj_style_t *__start_style_section_##name##theme;                              \
        extern __attribute__((weak)) ui_obj_style_t *__stop_style_section_##name##theme;                               \
        for (ui_obj_style_t **item = &(__start_style_section_##name##theme);                                           \
             item != &(__stop_style_section_##name##theme); item++)                                                    \
            lv_obj_add_style(obj, (*item)->style, (*item)->selector);                                                  \
    }
#else
#error "The platform is not supported"
#endif

/* Apply the style, It will change automatically according to the current theme style */
#define UI_STYLE_APPLY(obj, name)                                                                                      \
    {                                                                                                                  \
        if (ui_theme_get_type() == UI_THEME_DEFAULT)                                                                   \
            UI_STYLE_APPLY_WITH_THEME(obj, name, UI_THEME_DEFAULT)                                                     \
    }

/* -- function prototypes -- */

/**
 * @brief initialization
 */
void ui_theme_init(void);

/**
 * @brief Get the current theme type
 *
 * @return Current theme type
 */
ui_theme_type_t ui_theme_get_type(void);

/**
 * @brief Change the current theme type
 *
 * @param ui_theme Theme type
 */
void ui_theme_set_type(ui_theme_type_t ui_theme);

/* -- END OF function prototypes -- */

#endif
