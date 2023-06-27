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
import { RichText } from '@wordpress/block-editor';

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
          color: '#ffffff',
          role: 'host',
          textColor: '#ffffff',
          bubbleColor: '#ffffff',
          avatarUrl: '',
        },
      ],
    },
    editedSpeakerIndex: {
      type: 'number',
      default: 0,
    },
    linkColor: {
      type: 'string',
      default: '#0000ff', // default link color
    },
    linkHoverColor: {
      type: 'string',
      default: '#ff0000', // default link hover color
    },
  },

  edit: (props) => {
    const {
      attributes: { url, transcript, speakers, linkColor, linkHoverColor, editedSpeakerIndex },
      setAttributes,
    } = props;

    const blockProps = useBlockProps({ className: 'my-class-name' });

    const handleSelect = (index) => {
      setAttributes({
        editedSpeakerIndex: index,
      });
    };

    return (
      <div {...blockProps}>
        <InspectorControls>
          <PanelBody title={__("Speakers Settings", "textdomain")} initialOpen={true}>
          {speakers.map((speaker, i) => (
  <PanelBody title={speaker.name} initialOpen={false} key={i}>
    <Button isSecondary onClick={() => handleSelect(i)}>
      {__("Edit Speaker", "textdomain")}
    </Button>
    {i === editedSpeakerIndex && (
                  <div>
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
  title={__("Link Color", "textdomain")}
  initialOpen={false}
  colorSettings={[
    {
      value: linkColor,
      onChange: (linkColor) =>
        setAttributes({
          linkColor
        }),
      label: __("Link Color", "textdomain"),
    },
  ]}
/>

<PanelColorSettings
  title={__("Link Hover Color", "textdomain")}
  initialOpen={false}
  colorSettings={[
    {
      value: linkHoverColor,
      onChange: (linkHoverColor) =>
        setAttributes({
          linkHoverColor
        }),
      label: __("Link Hover Color", "textdomain"),
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
                  <>
                  {speaker.avatarUrl && <img src={speaker.avatarUrl} alt="Speaker Avatar" style={{ maxWidth: "100px", maxHeight: "100px" }}/>}
                  <br />
                  <Button variant="primary" onClick={open}>
                      {speaker.avatarUrl ? __("Replace Avatar", "textdomain") : __("Upload Avatar", "textdomain")}
                  </Button>
                  </>
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
<br />
<br />
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
                <br />
<br />
</div>
                )}
              </PanelBody>
            ))}
            <Button
              variant="primary"
              onClick={() =>
                setAttributes({
                  speakers: [
                    ...speakers,
                    {
                      name: "Speaker " + (speakers.length + 1),
                      color: "#ffffff",
                      role: "host",
                      textColor: '#ffffff',
                      bubbleColor: '#777',
                      avatarUrl: '',
                    },
                  ],
                })
              }
            >
              {__("Add Speaker", "textdomain")}
            </Button>
            </PanelBody>
          <PanelBody title={__("Transcript", "textdomain")} initialOpen={false}>
            <TextControl
              label={__("Transcript URL", "textdomain")}
              value={url}
              onChange={(url) => setAttributes({ url })}
            />
            
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
            let speakerData = speakers.find((s) => s.name === speaker);
  if(!speakerData){
    speakerData = {
      name: speaker,
      color: "#ffffff", // default color
      role: "host", // default role
      textColor: '#ffffff', // default text color
      bubbleColor: '#777', // default bubble color
      avatarUrl: '' // default avatar url
    }
  }
  return (
    <div key={i} className={`transcript-block-wrapper ${speakerData && speakerData.role === 'guest' ? 'guest' : 'host'}`}>
    <strong className="transcript-block-speech-speaker">{speaker}:</strong>
    <div className="transcript-block-speech" style={{ color: speakerData ? speakerData.textColor : "#000000", backgroundColor: speakerData ? speakerData.bubbleColor : "#ffffff", '--link-color': linkColor, 
    '--link-hover-color': linkHoverColor }}>
      <RichText
        tagName="span"
        className="transcript-block-speech-text"
        value={speech}
        onChange={(newSpeech) =>
          setAttributes({
            transcript: transcript.map((s, j) => (i === j ? { ...s, speech: newSpeech } : s)),
          })
        }
      />
    </div>
  </div>
            );
          })}
      </div>
    );
  },

  save: (props) => {
    const {
      attributes: { url, transcript, speakers, linkColor, linkHoverColor },
    } = props;

    const blockProps = useBlockProps.save();

    return (
      <div {...blockProps}>
        {url && <a href={url} download>{__("Download Transcript", "textdomain")}</a>}
        {transcript &&
          transcript.map(({ speaker, speech }, i) => {
            let speakerData = speakers.find((s) => s.name === speaker);
            if(!speakerData){
              speakerData = {
                name: speaker,
                color: "#ffffff", // default color
                role: "host", // default role
                textColor: '#ffffff', // default text color
                bubbleColor: '#777', // default bubble color
                avatarUrl: '' // default avatar url
              }
            }
            return (
              <div
  key={i}
  className={`transcript-block-wrapper ${speakerData && speakerData.role === 'guest' ? 'guest' : 'host'}`}
>

<strong className="transcript-block-speech-speaker">
  {speaker}:
</strong>


{speakerData.avatarUrl && (
  <img
    src={speakerData.avatarUrl}
    className={`transcript-block-avatar ${speakerData.role}`}
    alt={speaker + __(" Avatar", "textdomain")}
    style={{ borderRadius: "50%", width: "40px", height: "40px" }}
  />
)}

<div 
  className="transcript-block-speech" 
  style={{ color: speakerData ? speakerData.textColor : "#000000", backgroundColor: speakerData ? speakerData.bubbleColor : "#ffffff",
  '--link-color': linkColor, 
  '--link-hover-color': linkHoverColor }}
>
<span className="transcript-block-speech-text" dangerouslySetInnerHTML={{ __html: speech }}></span>

</div>

              </div>
            );
          })}
      </div>
    );
  },
});
