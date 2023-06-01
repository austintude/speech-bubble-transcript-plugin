/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, MediaUpload, Button } from '@wordpress/block-editor';

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
    edit: ( { attributes, setAttributes } ) => {
        return (
            <div {...useBlockProps()}>
                <MediaUpload
                    onSelect={ ( media ) => setAttributes( { url: media.url } ) }
                    allowedTypes={ [ 'application/pdf' ] }  // Adjust according to the file types you want to allow
                    render={ ( { open } ) => (
                        <Button onClick={ open }>
                            Upload File
                        </Button>
                    ) }
                />
            </div>
        );
    },
    save: () => {
        return null;
    },
} );