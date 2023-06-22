/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';
import {
  useBlockProps,
  MediaUpload,
  InspectorControls,
  PanelColorSettings,
} from '@wordpress/block-editor';
import { PanelBody, Button, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './style.scss';

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
      default: [
        {
          name: 'Speaker 1',
          color: '#000000',
          role: 'host',
          textColor: '#000000',
          bubbleColor: '#ffffff',
          avatarUrl: '',
        },
      ],
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
        <InspectorControls>
          <PanelBody title={__("Speakers Settings", "textdomain")} initialOpen={true}>
            {speakers.map((speaker, i) => (
              <div key={i}>
                <TextControl
                  label={__("Name", "textdomain")}
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

                <PanelColorSettings
                  title={__("Text Color", "textdomain")}
                  initialOpen={false}
                  colorSettings={[
                    {
                      value: speaker.textColor,
                      onChange: (textColor) =>
                        setAttributes({
                          speakers: speakers.map((s, j) => (i === j ? { ...s, textColor } : s)),
                        }),
                      label: __("Text Color", "textdomain"),
                    },
                  ]}
                />

                <PanelColorSettings
                  title={__("Speech Bubble Color", "textdomain")}
                  initialOpen={false}
                  colorSettings={[
                    {
                      value: speaker.bubbleColor,
                      onChange: (bubbleColor) =>
                        setAttributes({
                          speakers: speakers.map((s, j) => (i === j ? { ...s, bubbleColor } : s)),
                        }),
                      label: __("Speech Bubble Color", "textdomain"),
                    },
                  ]}
                />

                <SelectControl
                  label={__("Role", "textdomain")}
                  value={speaker.role}
                  options={[
                    { label: 'Guest', value: 'guest' },
                    { label: 'Host', value: 'host' },
                  ]}
                  onChange={(role) =>
                    setAttributes({
                      speakers: speakers.map((s, j) => (i === j ? { ...s, role } : s)),
                    })
                  }
                />

                <MediaUpload
                  onSelect={(media) => {
                    setAttributes({
                      speakers: speakers.map((s, j) => (i === j ? { ...s, avatarUrl: media.url } : s)),
                    });
                  }}
                  allowedTypes={['image']}
                  render={({ open }) => (
                    <Button onClick={open}>
                      {speaker.avatarUrl ? __("Replace Avatar", "textdomain") : __("Upload Avatar", "textdomain")}
                    </Button>
                  )}
                />

                {speaker.avatarUrl && (
                  <Button
                    isDestructive
                    onClick={() =>
                      setAttributes({
                        speakers: speakers.map((s, j) => (i === j ? { ...s, avatarUrl: '' } : s)),
                      })
                    }
                  >
                    {__("Remove Avatar", "textdomain")}
                  </Button>
                )}

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
                  speakers: [
                    ...speakers,
                    {
                      name: "Speaker " + (speakers.length + 1),
                      color: "#000000",
                      role: "host",
                      textColor: '#000000',
                      bubbleColor: '#ffffff',
                      avatarUrl: '',
                    },
                  ],
                })
              }
            >
              {__("Add Speaker", "textdomain")}
            </Button>
          </PanelBody>
        </InspectorControls>

        <MediaUpload
          onSelect={async (media) => {
            setAttributes({ url: media.url });
            try {
              const response = await fetch('/wp-json/transcript-blocks/v1/parse-transcript', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: media.id }),
              });

              console.log('HTTP response status:', response.status);
              console.log('HTTP response text:', await response.clone().text());

              if (!response.ok) {
                throw new Error('HTTP error ' + response.status);
              }

              const parsedContents = await response.json();
              setAttributes({ transcript: parsedContents });
            } catch (error) {
              console.error('Error during transcript parsing:', error);
            }
          }}
          allowedTypes={['text/plain']}
          render={({ open }) => (
            <Button onClick={open}>
              {__("Upload File", "textdomain")}
            </Button>
          )}
        />

        {transcript &&
          transcript.map(({ speaker, speech }, i) => {
            const speakerData = speakers.find((s) => s.name === speaker);

            return (
              <div
                key={i}
                className={`transcript-block-wrapper ${speakerData && speakerData.role === 'guest' ? 'guest' : 'host'}`}
                style={{ backgroundColor: speakerData ? speakerData.color : "#ffffff" }}
              >
                <strong className="transcript-block-speech-speaker">{speaker}:</strong>
                <div 
                  className="transcript-block-speech" 
                  style={{ backgroundColor: speakerData ? speakerData.bubbleColor : "#ffffff" }}
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
            const speakerData = speakers.find((s) => s.name === speaker);

            return (
              <div
                key={i}
                className={`transcript-block-wrapper ${speakerData.role === 'guest' ? 'guest' : 'host'}`}
                style={{ backgroundColor: speakerData ? speakerData.bubbleColor : "#ffffff" }}
              >
                <strong 
                  className="transcript-block-speech-speaker" 
                  style={{ color: speakerData ? speakerData.color : "#000000" }}
                >
                  {speaker}:
                </strong>
                <div 
                  className="transcript-block-speech" 
                  style={{ color: speakerData ? speakerData.textColor : "#000000" }}
                >
                  {speakerData.avatarUrl && (
                    <img
                      src={speakerData.avatarUrl}
                      className="transcript-block-avatar"
                      alt={speaker + __(" Avatar", "textdomain")}
                      style={{ borderRadius: "50%", width: "40px", height: "40px" }}
                    />
                  )}
                  <span className="transcript-block-speech-text">{speech}</span>
                </div>
              </div>
            );
          })}
      </div>
    );
  },
});
