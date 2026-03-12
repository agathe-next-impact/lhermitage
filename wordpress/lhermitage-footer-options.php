<?php
/**
 * Plugin Name: L'Hermitage - Footer Options
 * Description: Page d'options WordPress pour gérer le contenu du footer (réseaux sociaux, colonnes de liens, coordonnées).
 * Version: 1.0.0
 * Author: L'Hermitage Dev
 * Text Domain: lhermitage-footer
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the footer options page in WordPress admin
 */
add_action('admin_menu', function () {
    add_menu_page(
        'Footer',
        'Footer',
        'manage_options',
        'lhermitage-footer',
        'lhermitage_footer_render_page',
        'dashicons-align-wide-width',
        80
    );
});

/**
 * Register settings
 */
add_action('admin_init', function () {
    register_setting('lhermitage_footer', 'lhermitage_footer_options', [
        'type' => 'array',
        'sanitize_callback' => 'lhermitage_footer_sanitize',
    ]);
});

/**
 * Sanitize the footer options before saving
 */
function lhermitage_footer_sanitize($input)
{
    $clean = [];

    // Logo
    $clean['logo_url'] = esc_url_raw($input['logo_url'] ?? '');
    $clean['logo_alt'] = sanitize_text_field($input['logo_alt'] ?? '');

    // Description
    $clean['description'] = wp_kses_post($input['description'] ?? '');

    // Copyright
    $clean['copyright'] = sanitize_text_field($input['copyright'] ?? '');

    // Social links
    $socials = ['facebook', 'instagram', 'linkedin', 'youtube', 'twitter'];
    foreach ($socials as $social) {
        $clean['social_' . $social] = esc_url_raw($input['social_' . $social] ?? '');
    }

    // Footer columns (3 columns, each with title + up to 6 links)
    // Links are stored as slugs (e.g. "sejours-collectifs") — the frontend URL is prefixed in the REST response
    for ($col = 1; $col <= 3; $col++) {
        $clean['col_' . $col . '_title'] = sanitize_text_field($input['col_' . $col . '_title'] ?? '');
        for ($link = 1; $link <= 6; $link++) {
            $clean['col_' . $col . '_link_' . $link . '_label'] = sanitize_text_field($input['col_' . $col . '_link_' . $link . '_label'] ?? '');
            $slug = $input['col_' . $col . '_link_' . $link . '_url'] ?? '';
            // Normalize: strip leading/trailing slashes, keep only the path
            $slug = trim(sanitize_text_field($slug), '/ ');
            $clean['col_' . $col . '_link_' . $link . '_url'] = $slug;
        }
    }

    // Contact info
    $clean['contact_adresse'] = sanitize_text_field($input['contact_adresse'] ?? '');
    $clean['contact_telephone'] = sanitize_text_field($input['contact_telephone'] ?? '');
    $clean['contact_email'] = sanitize_email($input['contact_email'] ?? '');

    return $clean;
}

/**
 * Render the footer options admin page
 */
function lhermitage_footer_render_page()
{
    $opts = get_option('lhermitage_footer_options', []);
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Options du Footer', 'lhermitage-footer'); ?></h1>
        <form method="post" action="options.php">
            <?php settings_fields('lhermitage_footer'); ?>

            <!-- Logo & Description -->
            <h2><?php esc_html_e('Logo & Description', 'lhermitage-footer'); ?></h2>
            <table class="form-table">
                <tr>
                    <th><label for="logo_url">URL du logo</label></th>
                    <td>
                        <input type="url" id="logo_url" name="lhermitage_footer_options[logo_url]"
                               value="<?php echo esc_attr($opts['logo_url'] ?? ''); ?>" class="regular-text" />
                        <button type="button" class="button lhermitage-upload-btn" data-target="logo_url">
                            Choisir une image
                        </button>
                    </td>
                </tr>
                <tr>
                    <th><label for="logo_alt">Texte alternatif du logo</label></th>
                    <td>
                        <input type="text" id="logo_alt" name="lhermitage_footer_options[logo_alt]"
                               value="<?php echo esc_attr($opts['logo_alt'] ?? ''); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th><label for="description">Description</label></th>
                    <td>
                        <textarea id="description" name="lhermitage_footer_options[description]"
                                  rows="3" class="large-text"><?php echo esc_textarea($opts['description'] ?? ''); ?></textarea>
                        <p class="description">Courte description affichée sous le logo.</p>
                    </td>
                </tr>
            </table>

            <!-- Réseaux sociaux -->
            <h2><?php esc_html_e('Réseaux sociaux', 'lhermitage-footer'); ?></h2>
            <table class="form-table">
                <?php
                $socials = [
                    'facebook'  => 'Facebook',
                    'instagram' => 'Instagram',
                    'linkedin'  => 'LinkedIn',
                    'youtube'   => 'YouTube',
                    'twitter'   => 'X (Twitter)',
                ];
                foreach ($socials as $key => $label) : ?>
                    <tr>
                        <th><label for="social_<?php echo $key; ?>"><?php echo esc_html($label); ?></label></th>
                        <td>
                            <input type="url" id="social_<?php echo $key; ?>"
                                   name="lhermitage_footer_options[social_<?php echo $key; ?>]"
                                   value="<?php echo esc_attr($opts['social_' . $key] ?? ''); ?>"
                                   class="regular-text" placeholder="https://" />
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>

            <!-- Colonnes de liens -->
            <?php for ($col = 1; $col <= 3; $col++) : ?>
                <h2><?php printf(esc_html__('Colonne %d', 'lhermitage-footer'), $col); ?></h2>
                <table class="form-table">
                    <tr>
                        <th><label for="col_<?php echo $col; ?>_title">Titre</label></th>
                        <td>
                            <input type="text" id="col_<?php echo $col; ?>_title"
                                   name="lhermitage_footer_options[col_<?php echo $col; ?>_title]"
                                   value="<?php echo esc_attr($opts['col_' . $col . '_title'] ?? ''); ?>"
                                   class="regular-text" />
                        </td>
                    </tr>
                    <?php for ($link = 1; $link <= 6; $link++) : ?>
                        <tr>
                            <th>Lien <?php echo $link; ?></th>
                            <td>
                                <input type="text"
                                       name="lhermitage_footer_options[col_<?php echo $col; ?>_link_<?php echo $link; ?>_label]"
                                       value="<?php echo esc_attr($opts['col_' . $col . '_link_' . $link . '_label'] ?? ''); ?>"
                                       placeholder="Libellé" class="regular-text" style="width:40%;margin-right:10px;" />
                                <input type="text"
                                       name="lhermitage_footer_options[col_<?php echo $col; ?>_link_<?php echo $link; ?>_url]"
                                       value="<?php echo esc_attr($opts['col_' . $col . '_link_' . $link . '_url'] ?? ''); ?>"
                                       placeholder="sejours-collectifs/activites" class="regular-text" style="width:50%;" />
                                <p class="description" style="margin:2px 0 0 0;font-size:11px;color:#888;">Slug uniquement (ex: <code>sejours-collectifs</code>)</p>
                            </td>
                        </tr>
                    <?php endfor; ?>
                </table>
            <?php endfor; ?>

            <!-- Coordonnées -->
            <h2><?php esc_html_e('Coordonnées', 'lhermitage-footer'); ?></h2>
            <table class="form-table">
                <tr>
                    <th><label for="contact_adresse">Adresse</label></th>
                    <td>
                        <input type="text" id="contact_adresse"
                               name="lhermitage_footer_options[contact_adresse]"
                               value="<?php echo esc_attr($opts['contact_adresse'] ?? ''); ?>"
                               class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th><label for="contact_telephone">Téléphone</label></th>
                    <td>
                        <input type="text" id="contact_telephone"
                               name="lhermitage_footer_options[contact_telephone]"
                               value="<?php echo esc_attr($opts['contact_telephone'] ?? ''); ?>"
                               class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th><label for="contact_email">Email</label></th>
                    <td>
                        <input type="email" id="contact_email"
                               name="lhermitage_footer_options[contact_email]"
                               value="<?php echo esc_attr($opts['contact_email'] ?? ''); ?>"
                               class="regular-text" />
                    </td>
                </tr>
            </table>

            <!-- Copyright -->
            <h2><?php esc_html_e('Copyright', 'lhermitage-footer'); ?></h2>
            <table class="form-table">
                <tr>
                    <th><label for="copyright">Texte de copyright</label></th>
                    <td>
                        <input type="text" id="copyright"
                               name="lhermitage_footer_options[copyright]"
                               value="<?php echo esc_attr($opts['copyright'] ?? ''); ?>"
                               class="regular-text"
                               placeholder="© 2026 L'Hermitage. Tous droits réservés." />
                    </td>
                </tr>
            </table>

            <?php submit_button('Enregistrer'); ?>
        </form>
    </div>

    <script>
    jQuery(document).ready(function($) {
        $('.lhermitage-upload-btn').on('click', function(e) {
            e.preventDefault();
            var targetId = $(this).data('target');
            var frame = wp.media({ title: 'Choisir une image', multiple: false });
            frame.on('select', function() {
                var url = frame.state().get('selection').first().toJSON().url;
                $('#' + targetId).val(url);
            });
            frame.open();
        });
    });
    </script>
    <?php
}

/**
 * Enqueue media uploader on our options page
 */
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'toplevel_page_lhermitage-footer') {
        return;
    }
    wp_enqueue_media();
});

/**
 * Expose footer options via REST API for the Next.js frontend
 */
add_action('rest_api_init', function () {
    register_rest_route('lhermitage/v1', '/footer', [
        'methods'             => 'GET',
        'callback'            => 'lhermitage_footer_rest_callback',
        'permission_callback' => '__return_true',
    ]);
});

function lhermitage_footer_rest_callback()
{
    $opts = get_option('lhermitage_footer_options', []);

    // Build structured response
    $response = [
        'logo' => [
            'url' => $opts['logo_url'] ?? '',
            'alt' => $opts['logo_alt'] ?? '',
        ],
        'description' => $opts['description'] ?? '',
        'copyright'   => $opts['copyright'] ?? '',
        'social'      => [],
        'columns'     => [],
        'contact'     => [
            'adresse'   => $opts['contact_adresse'] ?? '',
            'telephone' => $opts['contact_telephone'] ?? '',
            'email'     => $opts['contact_email'] ?? '',
        ],
    ];

    // Social links (only non-empty)
    $socials = ['facebook', 'instagram', 'linkedin', 'youtube', 'twitter'];
    foreach ($socials as $social) {
        $url = $opts['social_' . $social] ?? '';
        if (!empty($url)) {
            $response['social'][$social] = $url;
        }
    }

    // Columns
    for ($col = 1; $col <= 3; $col++) {
        $title = $opts['col_' . $col . '_title'] ?? '';
        if (empty($title)) continue;

        $links = [];
        for ($link = 1; $link <= 6; $link++) {
            $label = $opts['col_' . $col . '_link_' . $link . '_label'] ?? '';
            $slug  = $opts['col_' . $col . '_link_' . $link . '_url'] ?? '';
            if (!empty($label) && !empty($slug)) {
                $links[] = ['label' => $label, 'url' => '/' . ltrim($slug, '/')];
            }
        }
        $response['columns'][] = ['title' => $title, 'links' => $links];
    }

    return rest_ensure_response($response);
}
