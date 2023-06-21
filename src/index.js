""/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, MediaUpload } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';


// Add console logs here
console.log('MediaUpload: ', MediaUpload);
console.log('Button: ', Button);
console.log('useBlockProps: ', useBlockProps);

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
        transcript: {
            type: 'array',
            default: [],
        },
    },
    edit: ( { attributes, setAttributes } ) => {
        const blockProps = useBlockProps( { className: 'my-class-name' } );
        return (
            <div {...blockProps}>
                <MediaUpload
                    onSelect={ async ( media ) => {
                        setAttributes( { url: media.url } );
                    
                        try {
                            const response = await fetch( '/wp-json/transcript-blocks/v1/parse-transcript', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify( { id: media.id } ),
                            } );
                    
                            if ( ! response.ok ) {
                                throw new Error( 'HTTP error ' + response.status );
                            }
                    
                            const parsedContents = await response.json();
                            setAttributes( { transcript: parsedContents } );
                        } catch ( error ) {
                            console.error( error );
                        }
                    } }
                    allowedTypes={ [ 'text/plain' ] }  // Adjust according to the file types you want to allow
                    render={ ( { open } ) => (
                        <Button onClick={ open }>
                            Upload File
                        </Button>
                    ) }
                />
    
                {/* Add this to display the transcript in the editor */}
                { attributes.transcript && attributes.transcript.map( ( { speaker, speech }, i ) => (
                    <div key={i} className="transcript-block-speech">
                        <strong>{ speaker }</strong>: { speech }
                    </div>
                ) ) }
            </div>
        );
    },
    save: ( { attributes } ) => {
        const blockProps = useBlockProps.save();
        return (
            <div {...blockProps}>
                { attributes.url && <a href={ attributes.url } download>Download Transcript</a> }
                { attributes.transcript && attributes.transcript.map( ( { speaker, speech }, i ) => (
                    <div key={i} className="transcript-block-speech">
                        <strong>{ speaker }</strong>: { speech }
                    </div>
                ) ) }
            </div>
        );
    },
    
} );
import './style.scss';
