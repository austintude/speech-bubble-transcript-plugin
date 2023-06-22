/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import ReactDOM from 'react-dom';
import { registerBlockType } from '@wordpress/blocks';
import {
  useBlockProps,
  MediaUpload,
  InspectorControls,
  PanelColorSettings,
} from '@wordpress/block-editor';
import { PanelBody, Button, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

registerBlockType('transcript-blocks/transcript-block', {
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
    speakers: {
      type: 'array',
      default: [],
    },
  },
  
  edit: (props) => {
    const {
      attributes: { url, transcript, speakers },
      setAttributes,
    } = props;

    const blockProps = useBlockProps({ className: 'my-class-name' });

    return (
      <div {...blockProps}>
        {speakers.map((speaker, i) => (
          <div key={i}>
            <TextControl
              value={speaker.name}
              onChange={(name) =>
                setAttributes({
                  speakers: speakers.map((s, j) => (i === j ? { ...s, name } : s)),
                })
              }
            />
            <PanelColorSettings
              title={__("Color Settings", "textdomain")}
              initialOpen={false}
              colorSettings={[
                {
                  value: speaker.color,
                  onChange: (color) =>
                    setAttributes({
                      speakers: speakers.map((s, j) => (i === j ? { ...s, color } : s)),
                    }),
                  label: __("Background Color", "textdomain"),
                },
              ]}
            />
            <Button
              isDestructive
              onClick={() =>
                setAttributes({
                  speakers: speakers.filter((s, j) => i !== j),
                })
              }
            >
              {__("Remove Speaker", "textdomain")}
            </Button>
          </div>
        ))}
        <Button
          variant="primary"
          onClick={() =>
            setAttributes({
              speakers: [...speakers, { name: "Speaker " + (speakers.length + 1), color: "#000000" }],
            })
          }
        >
          {__("Add Speaker", "textdomain")}
        </Button>


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
            allowedTypes={ [ 'text/plain' ] }
            render={ ( { open } ) => (
                <Button onClick={ open }>
                    {__("Upload File", "textdomain")}
                </Button>
            ) }
        />

        {transcript &&
          transcript.map(({ speaker, speech }, i) => {
            const speakerData = speakers.find((s) => s.name === speaker);
          
            return (
              <div key={i} className="transcript-block-wrapper">
                <strong className="transcript-block-speech-speaker">{speaker}:</strong>
                <div 
                  className="transcript-block-speech" 
                  style={{ backgroundColor: speakerData ? speakerData.color : "#ffffff" }}
                >
                  <span className="transcript-block-speech-text">{speech}</span>
                </div>
              </div>
            );
          })}

      </div>
    );
  },
  save: (props) => {
    const {
      attributes: { url, transcript, speakers },
    } = props;
  
    const blockProps = useBlockProps.save();
    
    return (
      <div {...blockProps}>
        {url && <a href={url} download>{__("Download Transcript", "textdomain")}</a>}
        {transcript &&
          transcript.map(({ speaker, speech }, i) => {
            const speakerData = speakers.find((s) => s.name === speaker) || {};
          
            return (
              <div key={i} className="transcript-block-wrapper">
                <strong className="transcript-block-speech-speaker">{speaker}:</strong>
                <div 
                  className="transcript-block-speech" 
                  style={{ backgroundColor: speakerData.color }}
                >
                  <span className="transcript-block-speech-text">{speech}</span>
                </div>
              </div>
            );
          })}
      </div>
    );
  },
});
import './style.scss';
