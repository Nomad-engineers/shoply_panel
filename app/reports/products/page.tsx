'use client';
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ProductPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const url=process.env.NEXT_PUBLIC_API_URL
  const token=localStorage.getItem('access_token')
  // Когда файл выбран или перетащен
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);
  const sendFileToServer = async () => {
  if (!file) return;
  setLoading(true);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${url}/panel/excel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      alert('✅ Товары успешно обновлены!');
      setFile(null);
    } else {
      alert(`❌ Ошибка: ${result.message}`);
    }
  } catch (error) {
    alert('❌ Критическая ошибка сервера или таймаут');
  } finally {
    setLoading(false);
  }
};

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h2>Загрузка Excel файла (отправка файла на бэк)</h2>

      <div {...getRootProps()} style={dropzoneStyle(isDragActive)}>
        <input {...getInputProps()} />
        {file ? (
          <p>Выбран файл: <strong>{file.name}</strong></p>
        ) : (
          <p>Перетащите файл сюда или кликните для выбора</p>
        )}
      </div>

      {file && (
        <button 
          onClick={sendFileToServer} 
          disabled={loading}
          style={buttonStyle(loading)}
        >
          {loading ? 'Отправка...' : 'Отправить файл'}
        </button>
      )}
    </div>
  );
}

// Простые стили
const dropzoneStyle = (isActive: boolean): React.CSSProperties => ({
  border: '2px dashed #ccc',
  padding: '40px',
  textAlign: 'center',
  borderRadius: '10px',
  backgroundColor: isActive ? '#f0f0f0' : '#fff',
  cursor: 'pointer',
  marginBottom: '20px'
});

const buttonStyle = (loading: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  backgroundColor: loading ? '#ccc' : '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: loading ? 'not-allowed' : 'pointer'
});