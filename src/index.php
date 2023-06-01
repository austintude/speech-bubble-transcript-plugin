<?php
/**
 * Functions to register client-side assets (scripts and stylesheets) for the
 * Gutenberg block.
 *
 * @package transcripts-block
 */

 if( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

 class TranscriptBlock {
	 function __construct() {
		 add_action('init', array($this, 'register_block'));
	 }

	 function register_block() {
		 if( function_exists('register_block_type') ) {
			 register_block_type( 'transcript-blocks/transcript-block', array(
				 'render_callback' => array($this, 'render_block')
			 ));
		 }
	 }

	 function render_block($attributes) {
		 if (isset($attributes['url'])) {
			 return '<a href="' . esc_url($attributes['url']) . '" download>Download Transcript</a>';
		 } else {
			 return NULL;
		 }
	 }
 }

 $transcriptBlock = new TranscriptBlock;
 function create_block_transcripts_block_init() {
	register_block_type( __DIR__ );
}
add_action( 'init', 'create_block_transcripts_block_init' );
