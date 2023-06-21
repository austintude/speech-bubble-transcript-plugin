<?php
/**
 * Plugin Name:       Transcripts Block
 * Description:       Add downloadable transcripts to your post.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.15
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
    wp_register_script(
        'transcripts-block-editor',
        plugins_url( 'build/index.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-block-editor' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' ),
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
    wp_enqueue_script(
        'transcript-block-script',
        plugin_dir_url( __FILE__ ) . 'build/index.js',
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'jquery'),
        true
    );

    $speaker_colors = array(
        'speaker_1_color' => get_option('speaker_1_color'),
        'speaker_2_color' => get_option('speaker_2_color'),
        'speaker_3_color' => get_option('speaker_3_color'),
    );

    wp_localize_script('transcript-block-script', 'transcriptBlockParams', $speaker_colors);
    wp_enqueue_style(
        'transcript-block-style',
        plugins_url( 'build/style-index.css', __FILE__ ),
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/style-index.css' )
    );
}

add_action('enqueue_block_editor_assets', 'transcript_block_scripts');

// ... The rest of your code ...
