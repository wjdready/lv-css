#include "ui_theme.h"

static ui_theme_type_t current_theme = UI_THEME_DEFAULT;

lv_theme_apply_cb_t ui_theme_default_get_cb(void);

static void all_style_init(void)
{
#ifdef __ARMCC_VERSION /* ARM C Compiler */
    extern __attribute__((weak)) ui_obj_style_t *all_style_section$$Base;
    extern __attribute__((weak)) ui_obj_style_t *all_style_section$$Limit;
    for (ui_obj_style_t **item = &(all_style_section$$Base); item != &(all_style_section$$Limit); item++)
        if (item && (*item)->init_cb)
        {
            lv_style_init((*item)->style);
            (*item)->init_cb((*item)->style);
        }
#elif defined(__GNUC__)
    extern __attribute__((weak)) ui_obj_style_t *__start_all_style_section;
    extern __attribute__((weak)) ui_obj_style_t *__stop_all_style_section;
    for (ui_obj_style_t **item = &(__start_all_style_section); item != &(__stop_all_style_section); item++)
        if (item && (*item)->init_cb)
        {
            lv_style_init((*item)->style);
            (*item)->init_cb((*item)->style);
        }
#else
#error "The platform is not supported"
#endif
}

/**
 * @brief initialization
 */
void ui_theme_init(void)
{
    all_style_init();

    ui_theme_set_type(UI_THEME_DEFAULT);
}

/**
 * @brief Get the current theme type
 *
 * @return Current theme type
 */
ui_theme_type_t ui_theme_get_type(void)
{
    return current_theme;
}

/**
 * @brief Change the current theme type
 *
 * @param ui_theme Theme type
 */
void ui_theme_set_type(ui_theme_type_t ui_theme)
{
    static lv_theme_t th_new;

    lv_theme_t *th_act = lv_disp_get_theme(NULL);
    th_new = *th_act;
    lv_theme_set_parent(&th_new, th_act);
    lv_theme_apply_cb_t new_theme_apply_cb = NULL;

    switch (ui_theme)
    {
    case UI_THEME_DEFAULT:
        current_theme = UI_THEME_DEFAULT;
        new_theme_apply_cb = ui_theme_default_get_cb();
        break;
    }

    lv_theme_set_apply_cb(&th_new, new_theme_apply_cb);
    lv_disp_set_theme(NULL, &th_new);
}
