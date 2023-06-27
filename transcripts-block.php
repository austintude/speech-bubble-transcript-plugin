<?php
/**
 * Plugin Name:       Transcripts Block
 * Description:       Add downloadable transcripts to your post.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           1.3.7
 * Author:            We Rock DM
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       transcripts-block
 *
 * @package           create-block
 */

 if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function create_block_transcripts_block_block_init() {
    $index_js = 'build/index.js';
    wp_register_script(
        'transcripts-block-editor',
        plugins_url( $index_js, __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components' ),
        filemtime( plugin_dir_path( __FILE__ ) . $index_js ),
        true
    );

    register_block_type(
        'transcript-blocks/transcript-block',
        array(
            'editor_script' => 'transcripts-block-editor',
            'style' => 'transcript-block-style',
        )
    );

}

add_action( 'init', 'create_block_transcripts_block_block_init' );

function handle_uploaded_transcript( WP_REST_Request $request ) {
    $file_id = $request->get_param( 'id' );

    if ( ! $file_id ) {
        return new WP_Error( 'no_file', 'No file ID provided', array( 'status' => 400 ) );
    }

    $file_path = get_attached_file( $file_id );

    if ( ! $file_path || ! file_exists( $file_path ) ) {
        return new WP_Error( 'file_not_found', 'File not found', array( 'status' => 404 ) );
    }

    $file_contents = file_get_contents( $file_path );

    // Parse the file contents here...
    $parsed_contents = array();
    $lines = explode("\n", $file_contents);

    $cur_speaker = '';
    $cur_speech = '';

    foreach ($lines as $line) {
        if ($line == '') continue;  // Skip empty lines

        $parts = explode(":", $line, 2);  // Split at the first colon

        if (count($parts) == 2) {
            // This line starts a new speech
            if ($cur_speaker != '' && $cur_speech != '') {
                // Add the previous speech to the parsed contents
                $parsed_contents[] = array(
                    "speaker" => $cur_speaker,
                    "speech" => $cur_speech,
                );
            }

            $cur_speaker = trim($parts[0]);
            $cur_speech = trim($parts[1]);
        } else {
            // This line continues the current speech
            $cur_speech .= ' ' . trim($line);
        }
    }

    // Add the final speech to the parsed contents
    if ($cur_speaker != '' && $cur_speech != '') {
        $parsed_contents[] = array(
            "speaker" => $cur_speaker,
            "speech" => $cur_speech,
        );
    }

    // Return the parsed contents
    return rest_ensure_response( $parsed_contents );
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'transcript-blocks/v1', '/parse-transcript', array(
        'methods' => WP_REST_Server::EDITABLE,
        'callback' => 'handle_uploaded_transcript',
    ) );
} );

function transcript_block_scripts() {
    $index_js = 'build/index.js';
    $style_index_css = 'build/style-index.css';

    wp_enqueue_script(
        'transcript-block-script',
        plugin_dir_url( __FILE__ ) . $index_js,
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'jquery'),
        filemtime( plugin_dir_path( __FILE__ ) . $index_js ),
        true
    );

    $speaker_colors = array(
        'speaker_1_color' => get_option('speaker_1_color', '#000000'),
        'speaker_2_color' => get_option('speaker_2_color', '#000000'),
        'speaker_3_color' => get_option('speaker_3_color', '#000000'),
    );

    wp_localize_script('transcript-block-script', 'transcriptBlockParams', $speaker_colors);

    wp_enqueue_style(
        'transcript-block-style',
        plugins_url( $style_index_css, __FILE__ ),
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . $style_index_css )
    );
}

function transcript_block_frontend_styles() {
    $style_index_css = 'build/style-index.css';

    wp_enqueue_style(
        'transcript-block-frontend-style',
        plugins_url( $style_index_css, __FILE__ ),
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . $style_index_css )
    );
}

add_action( 'wp_enqueue_scripts', 'transcript_block_frontend_styles' );

function transcript_block_add_admin_menu() {
    add_menu_page(
        'Transcript Block Settings', // page title
        'Transcript Block Settings', // menu title
        'manage_options', // capability
        'transcript_block', // menu slug
        'transcript_block_options_page' // callback function
    );
}

add_action( 'admin_menu', 'transcript_block_add_admin_menu' );

function transcript_block_options_page() {
    // This function will contain the HTML for your settings page.
    // You'll want to add form fields here for your speaker colors,
    // and handle saving those options.
}

add_action('enqueue_block_editor_assets', 'transcript_block_scripts');

// ... The rest of your code ...
error_log('Parsed contents: ' . print_r($parsed_contents, true));

