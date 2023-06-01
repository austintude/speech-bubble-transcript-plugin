/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, RichText } from '@wordpress/block-editor';

registerBlockType( 'transcript-blocks/transcript-block', {
    apiVersion: 2,
    title: 'Transcript Block',
    description: 'Add downloadable transcripts to your post.',
    category: 'media',
    icon: 'media-text',
    supports: {
        html: false,
    },
    attributes: {
        url: {
            type: 'string',
            default: '',
        },
    },
    edit: ( props ) => {
        function fileDecoder(identifier) {
            const input = document.querySelector(`#${identifier}`);
            const fReader = new FileReader();
            fReader.readAsDataURL(input.files[0]);
            fReader.onloadend = function(event) {
                props.setAttributes({url: event.target.result})
            }
        }

        return (
            <div {...useBlockProps()}>
                <label>Upload a file</label>
                <input id='upload-file' type="file" onChange={() => fileDecoder('upload-file')} />
            </div>
        );
    },
    save: () => {
        return null;
    },
} );

