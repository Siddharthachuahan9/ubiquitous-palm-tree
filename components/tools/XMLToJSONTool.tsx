'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { convertXMLToJSON, XMLToJSONResult } from '@/lib/utils/xmlToJson';
import { ShareButton } from '@/components/common/ShareButton';
import { loadStateFromURL } from '@/lib/utils/shareState';
import styles from './XMLToJSONTool.module.css';

export function XMLToJSONTool() {
  const [xmlInput, setXmlInput] = useState('');
  const [result, setResult] = useState<XMLToJSONResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConvert = useCallback((inputXml?: string) => {
    const xml = inputXml || xmlInput;

    if (!xml.trim()) {
      setError('Please enter XML to convert');
      setResult(null);
      return;
    }

    const conversionResult = convertXMLToJSON(xml);

    if (conversionResult.success) {
      setResult(conversionResult);
      setError(null);
    } else {
      setError(conversionResult.error || 'Conversion failed');
      setResult(null);
    }
  }, [xmlInput]);

  // Load shared state from URL on mount
  useEffect(() => {
    const sharedState = loadStateFromURL();

    if (!sharedState) {
      console.log('[XMLToJSON] No shared state found in URL');
      return;
    }

    console.log('[XMLToJSON] Shared state loaded:', {
      tool: sharedState.tool,
      hasXmlInput: !!sharedState.data?.xmlInput,
      xmlLength: sharedState.data?.xmlInput?.length || 0
    });

    if (sharedState.tool === 'xml-to-json') {
      const { xmlInput: sharedXml } = sharedState.data;
      if (sharedXml) {
        console.log('[XMLToJSON] Restoring XML input and auto-converting...');
        setXmlInput(sharedXml);
        // Auto-convert on load
        setTimeout(() => {
          console.log('[XMLToJSON] Executing conversion...');
          handleConvert(sharedXml);
        }, 100);
      } else {
        console.warn('[XMLToJSON] Shared state has no xmlInput');
      }
    } else {
      console.warn('[XMLToJSON] Tool mismatch. Expected xml-to-json, got:', sharedState.tool);
    }
  }, [handleConvert]);

  const handleClear = () => {
    setXmlInput('');
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyOutput = async () => {
    if (result?.json) {
      try {
        await navigator.clipboard.writeText(result.json);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setXmlInput(content);
      // Auto-convert after upload
      setTimeout(() => handleConvert(content), 100);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleConvert();
    }
  };

  return (
    <div className={styles.container}>
      {/* Input Panel */}
      <div className={styles.inputPanel}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>XML to JSON</h2>
            <p className={styles.subtitle}>
              Convert XML into JSON locally in your browser
            </p>
          </div>
          <div className={styles.headerActions}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml,.txt"
              onChange={handleUpload}
              className={styles.fileInput}
              id="xml-file-upload"
            />
            <label htmlFor="xml-file-upload" className={styles.uploadButton}>
              📁 Upload XML
            </label>
            <button className={styles.clearButton} onClick={handleClear}>
              Clear
            </button>
            <button className={styles.convertButton} onClick={() => handleConvert()}>
              Convert
            </button>
            <ShareButton
              tool="xml-to-json"
              data={{ xmlInput, jsonOutput: result?.json || '' }}
            />
            <button
              className={styles.copyButton}
              onClick={handleCopyOutput}
              disabled={!result?.json}
            >
              {copied ? '✓ Copied' : '📋 Copy Output'}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="xml-input" className={styles.label}>
            XML Input
          </label>
          <textarea
            id="xml-input"
            className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
            placeholder="<user id=&quot;1&quot;>&#10;  <name>Ana</name>&#10;  <email>ana@example.com</email>&#10;</user>"
            value={xmlInput}
            onChange={(e) => setXmlInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        )}

        <div className={styles.privacyNotice}>
          <span className={styles.privacyIcon}>🔒</span>
          <span className={styles.privacyText}>
            All conversion happens locally. Your XML never leaves your browser.
          </span>
        </div>
      </div>

      {/* Output Panel */}
      <div className={styles.outputPanel}>
        {result ? (
          <div className={styles.results}>
            <div className={styles.resultHeader}>
              <h3 className={styles.resultTitle}>JSON Output</h3>
              <button
                className={styles.copyButtonInline}
                onClick={handleCopyOutput}
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>

            <div className={styles.outputBox}>
              <textarea
                className={styles.outputText}
                value={result.json}
                readOnly
              />
            </div>

            <div className={styles.metadata}>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Input Size</span>
                <span className={styles.metadataValue}>{result.inputSize} chars</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Output Size</span>
                <span className={styles.metadataValue}>{result.outputSize} chars</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Status</span>
                <span className={styles.metadataValue}>✓ Success</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔄</span>
            <p className={styles.emptyTitle}>Paste XML to convert</p>
            <p className={styles.emptyText}>
              Upload an XML file or paste XML directly into the input field, then click Convert
            </p>
            <div className={styles.examples}>
              <p className={styles.examplesTitle}>Try this example:</p>
              <button
                className={styles.exampleButton}
                onClick={() => {
                  const exampleXML = `<user id="1">
  <name>Ana</name>
  <email>ana@example.com</email>
  <settings>
    <theme>dark</theme>
    <notifications enabled="true"/>
  </settings>
</user>`;
                  setXmlInput(exampleXML);
                  setTimeout(() => handleConvert(exampleXML), 100);
                }}
              >
                User Profile XML
              </button>
              <button
                className={styles.exampleButton}
                onClick={() => {
                  const exampleXML = `<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
  </book>
</catalog>`;
                  setXmlInput(exampleXML);
                  setTimeout(() => handleConvert(exampleXML), 100);
                }}
              >
                Book Catalog XML
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
