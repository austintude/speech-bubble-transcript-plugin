<?php
/**
 * Plugin Name:       Transcripts Block
 * Description:       Add downloadable transcripts to your post.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Your Name
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
        array( 'wp-blocks', 'wp-element', 'wp-editor' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' ),
        true
    );

    register_block_type(
        'transcripts-block/transcripts-block',
        array(
            'editor_script' => 'transcripts-block-editor',
        )
    );
}

add_action( 'init', 'create_block_transcripts_block_block_init' );
