/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';
import WickModal from 'Editor/Modals/WickModal/WickModal';
import AudioPlayer from 'Editor/Util/AudioPlayer/AudioPlayer';
import './_gallery.scss';

class Gallery extends Component {
  static get BASE_URL () {
    return 'https://ed-info.github.io/gallery/';
  }

  static get IMAGES_LIST_URL () {
    return Gallery.BASE_URL + 'images.txt';
  }

  static get FONTS_LIST_URL () {
    return Gallery.BASE_URL + 'fonts.txt';
  }

  static get SOUNDS_LIST_URL () {
    return Gallery.BASE_URL + 'sounds.txt';
  }

  static get WICKOBJS_LIST_URL () {
    return Gallery.BASE_URL + 'wickobjs.txt';
  }

  constructor (props) {
    super(props);
    this.state = {
      activeTab: 'images',
      allImages: [],
      imageCategories: [],
      currentImageCategory: 'всі',
      fonts: [],
      loadedFonts: {},
      allSounds: [],
      soundCategories: [],
      currentSoundCategory: 'всі',
      wickobjs: [],
      wickobjsLoading: true,
      soundsLoading: true,
      imagesLoading: true,
      fontsLoading: true,
      loadError: false,
      selectedItem: null,
      inserting: false,
    };
  }

  componentDidMount () {
    this.fetchImages();
    this.fetchFonts();
    this.fetchSounds();
    this.fetchWickobjs();
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevProps.open && this.props.open) {
      this.setState({ selectedItem: null, inserting: false });
    }
    if (this.state.activeTab === 'fonts' && prevState.activeTab !== 'fonts') {
      this.loadAllFonts();
    }
  }

  extractFileName = (fullPath) => {
    const parts = fullPath.split('/');
    return parts[parts.length - 1] || fullPath;
  }

  formatDisplayName = (fileName) => {
    let name = fileName.replace(/\.[^.]+$/, '');
    name = name.replace(/[+_%20]/g, ' ').trim();
    return name || fileName;
  }

  getCategoryFromPath = (fullPath) => {
    const parts = fullPath.split('/');
    if (parts.length >= 2 && parts[1]) {
      return parts[1];
    }
    return 'інше';
  }

  fetchImages = () => {
    fetch(Gallery.IMAGES_LIST_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response.text();
      })
      .then((text) => {
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

        const allImages = [];
        const categorySet = new Set();

        lines.forEach((line) => {
          const category = this.getCategoryFromPath(line);
          const fileName = this.extractFileName(line);
          allImages.push({
            fullPath: line,
            category: category,
            fileName: fileName,
          });
          categorySet.add(category);
        });

        const categories = Array.from(categorySet).sort();
        let currentCategory = categories.length > 1 ? 'всі' : (categories[0] || 'всі');
        if (currentCategory === undefined) currentCategory = 'всі';

        this.setState({
          allImages,
          imageCategories: ['всі', ...categories],
          currentImageCategory: currentCategory,
          imagesLoading: false,
        });
      })
      .catch((error) => {
        console.error('Error loading image list:', error);
        this.setState({ imagesLoading: false, loadError: true });
      });
  }

  fetchFonts = () => {
    fetch(Gallery.FONTS_LIST_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response.text();
      })
      .then((text) => {
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

        const fonts = lines.map((line) => ({ token: line }));

        if (this.state.activeTab === 'fonts') {
          this.loadAllFonts();
        }

        this.setState({ fonts, fontsLoading: false });
      })
      .catch((error) => {
        console.error('Error loading font list:', error);
        this.setState({ fontsLoading: false, loadError: true });
      });
  }

  fetchSounds = () => {
    fetch(Gallery.SOUNDS_LIST_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response.text();
      })
      .then((text) => {
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

        const allSounds = [];
        const categorySet = new Set();

        lines.forEach((line) => {
          const category = this.getCategoryFromPath(line);
          const fileName = this.extractFileName(line);
          allSounds.push({
            fullPath: line,
            category: category,
            fileName: fileName,
          });
          categorySet.add(category);
        });

        const categories = Array.from(categorySet).sort();
        let currentCategory = categories.length > 1 ? 'всі' : (categories[0] || 'всі');
        if (currentCategory === undefined) currentCategory = 'всі';

        this.setState({
          allSounds,
          soundCategories: ['всі', ...categories],
          currentSoundCategory: currentCategory,
          soundsLoading: false,
        });
      })
      .catch((error) => {
        console.error('Error loading sound list:', error);
        this.setState({ soundsLoading: false, loadError: true });
      });
  }

  fetchWickobjs = () => {
    fetch(Gallery.WICKOBJS_LIST_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response.text();
      })
      .then((text) => {
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

        const wickobjs = lines.map((line) => {
          const separatorIndex = line.indexOf(':');
          const fullPath = separatorIndex === -1 ? line : line.slice(0, separatorIndex).trim();
          const description = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1).trim();
          return {
            fullPath,
            fileName: this.extractFileName(fullPath),
            description,
          };
        });

        this.setState({ wickobjs, wickobjsLoading: false });
      })
      .catch((error) => {
        console.error('Error loading wickobject list:', error);
        this.setState({ wickobjsLoading: false, loadError: true });
      });
  }

  getWickobjUrl = (fullPath) => {
    return Gallery.BASE_URL + fullPath;
  }

  getFontName = (token) => {
    let name = token.replace(/^(fonts|images|sounds)\//i, '').trim();
    name = name.replace(/\.(ttf|otf)$/i, '').trim();
    return name || token;
  }

  getFontUrl = (token) => {
    return Gallery.BASE_URL + token;
  }

  getFontMIMEType = (token) => {
    if (/\.otf$/i.test(token)) return 'font/otf';
    return 'font/ttf';
  }

  getSoundUrl = (fullPath) => {
    return Gallery.BASE_URL + fullPath;
  }

  getSoundMIMEType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'ogg') return 'audio/ogg';
    if (ext === 'wav') return 'audio/wav';
    return 'audio/mpeg';
  }

  loadAllFonts = () => {
    const { fonts, loadedFonts } = this.state;
    fonts.forEach((font) => {
      const name = this.getFontName(font.token);
      if (loadedFonts[name] || loadedFonts[name] === false) return;
      this.setState(prevState => ({
        loadedFonts: { ...prevState.loadedFonts, [name]: false },
      }));
      fetch(this.getFontUrl(font.token))
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          const face = new FontFace(name, buffer);
          return face.load();
        })
        .then((face) => {
          document.fonts.add(face);
          this.setState(prevState => ({
            loadedFonts: { ...prevState.loadedFonts, [name]: true },
          }));
        })
        .catch(() => {
          this.setState(prevState => ({
            loadedFonts: { ...prevState.loadedFonts, [name]: false },
          }));
        });
    });
  }

  selectTab = (tab) => {
    this.setState({ activeTab: tab, selectedItem: null, inserting: false });
    if (tab === 'fonts') {
      this.loadAllFonts();
    }
  }

  selectCategory = (category) => {
    if (this.state.activeTab === 'sounds') {
      this.setState({ currentSoundCategory: category });
    } else {
      this.setState({ currentImageCategory: category });
    }
  }

  getFilteredItems = () => {
    const { activeTab } = this.state;
    if (activeTab === 'sounds') {
      const { allSounds, currentSoundCategory } = this.state;
      if (currentSoundCategory === 'всі') return allSounds;
      return allSounds.filter(item => item.category === currentSoundCategory);
    }
    if (activeTab === 'wickobjs') {
      return this.state.wickobjs;
    }
    const { allImages, currentImageCategory } = this.state;
    if (currentImageCategory === 'всі') return allImages;
    return allImages.filter(item => item.category === currentImageCategory);
  }

  openPreview = (item) => {
    let displayName = '';
    if (item.token) {
      displayName = this.getFontName(item.token);
    } else if (item.fileName) {
      displayName = this.formatDisplayName(item.fileName);
    }
    this.setState({
      selectedItem: {
        ...item,
        displayName: displayName,
      },
    });
  }

  closePreview = () => {
    this.setState({ selectedItem: null, inserting: false });
  }

  insertItem = () => {
    const { selectedItem, activeTab } = this.state;
    if (!selectedItem || this.state.inserting) return;

    this.setState({ inserting: true }, () => {
      if (activeTab === 'fonts') {
        fetch(this.getFontUrl(selectedItem.token))
          .then((response) => response.arrayBuffer())
          .then((buffer) => {
            const blob = new Blob([buffer], { type: this.getFontMIMEType(selectedItem.token) });
            blob.lastModifiedDate = new Date();
            blob.name = this.getFontName(selectedItem.token) + (this.getFontMIMEType(selectedItem.token) === 'font/otf' ? '.otf' : '.ttf');
            this.props.createAssets([blob], []);
            this.closePreview();
            this.props.toggle();
          })
          .catch((error) => {
            console.error('Error importing gallery font:', error);
            this.setState({ inserting: false });
          });
      } else if (activeTab === 'sounds') {
        fetch(this.getSoundUrl(selectedItem.fullPath))
          .then((response) => response.arrayBuffer())
          .then((buffer) => {
            const blob = new Blob([buffer], { type: this.getSoundMIMEType(selectedItem.fileName) });
            blob.lastModifiedDate = new Date();
            blob.name = selectedItem.fileName;
            this.props.createAssets([blob], []);
            this.closePreview();
            this.props.toggle();
          })
          .catch((error) => {
            console.error('Error importing gallery sound:', error);
            this.setState({ inserting: false });
          });
      } else if (activeTab === 'wickobjs') {
        fetch(this.getWickobjUrl(selectedItem.fullPath))
          .then((response) => response.blob())
          .then((blob) => {
            blob.lastModifiedDate = new Date();
            blob.name = selectedItem.fileName;
            this.props.createAssets([blob], []);
            this.closePreview();
            this.props.toggle();
          })
          .catch((error) => {
            console.error('Error importing gallery wickobject:', error);
            this.setState({ inserting: false });
          });
      } else {
        fetch(this.getImageUrl(selectedItem.fullPath))
          .then((response) => response.arrayBuffer())
          .then((buffer) => {
            const type = this.detectImageType(buffer, selectedItem.fileName);
            const blob = new Blob([buffer], { type });
            blob.lastModifiedDate = new Date();
            blob.name = selectedItem.fileName;
            this.props.createAssets([blob], []);
            this.closePreview();
            this.props.toggle();
          })
          .catch((error) => {
            console.error('Error importing gallery image:', error);
            this.setState({ inserting: false });
          });
      }
    });
  }

  getImageUrl = (fullPath) => {
    return Gallery.BASE_URL + fullPath;
  }

  detectImageType = (buffer, fileName) => {
    const bytes = new Uint8Array(buffer.slice(0, 8));
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return 'image/gif';
    }
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return 'image/png';
    }
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return 'image/jpeg';
    }
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'gif') return 'image/gif';
    if (ext === 'png') return 'image/png';
    return 'image/jpeg';
  }

  renderTabs = () => {
    const { t } = this.props;
    const tabs = [
      { key: 'images', label: t('gallery.tabs.images') },
      { key: 'fonts', label: t('gallery.tabs.fonts') },
      { key: 'sounds', label: t('gallery.tabs.sounds') },
      { key: 'wickobjs', label: t('gallery.tabs.objects') },
    ];
    return tabs.map((tab) => (
      <button
        key={tab.key}
        className={`gallery-tab-btn${this.state.activeTab === tab.key ? ' active' : ''}`}
        onClick={() => this.selectTab(tab.key)}>
        {tab.label}
      </button>
    ));
  }

  renderCategories = () => {
    const { activeTab } = this.state;
    let categories, currentCategory;
    if (activeTab === 'sounds') {
      categories = this.state.soundCategories;
      currentCategory = this.state.currentSoundCategory;
    } else {
      categories = this.state.imageCategories;
      currentCategory = this.state.currentImageCategory;
    }
    return categories.map((category) => {
      const display = category === 'всі' ? 'Всі' : category.charAt(0).toUpperCase() + category.slice(1);
      return (
        <button
          key={category}
          className={`gallery-category-btn${currentCategory === category ? ' active' : ''}`}
          onClick={() => this.selectCategory(category)}>
          {display}
        </button>
      );
    });
  }

  renderImageGrid = () => {
    const { allImages, imagesLoading, loadError } = this.state;
    const filtered = this.getFilteredItems();
    const { t } = this.props;

    if (imagesLoading) {
      return <div className="gallery-no-images">{t('gallery.loading')}</div>;
    }
    if (loadError) {
      return <div className="gallery-no-images gallery-error">{t('gallery.loadError')}</div>;
    }
    if (allImages.length === 0) {
      return <div className="gallery-no-images">{t('gallery.noImages')}</div>;
    }
    if (filtered.length === 0) {
      return <div className="gallery-no-images">{t('gallery.emptyCategory')}</div>;
    }

    return filtered.map((image) => {
      const displayName = this.formatDisplayName(image.fileName);
      const fullUrl = this.getImageUrl(image.fullPath);
      return (
        <div
          key={image.fullPath}
          className="gallery-grid-item"
          onClick={() => this.openPreview({ ...image, url: fullUrl })}>
          <div className="gallery-img-wrapper">
            <img src={fullUrl} alt={displayName} loading="lazy" />
          </div>
          <div className="gallery-image-name">{displayName}</div>
        </div>
      );
    });
  }

  renderFontGrid = () => {
    const { fonts, fontsLoading, loadedFonts, loadError } = this.state;
    const { t } = this.props;

    if (fontsLoading) {
      return <div className="gallery-no-images">{t('gallery.loading')}</div>;
    }
    if (loadError) {
      return <div className="gallery-no-images gallery-error">{t('gallery.loadError')}</div>;
    }
    if (fonts.length === 0) {
      return <div className="gallery-no-images">{t('gallery.noFonts')}</div>;
    }

    return fonts.map((font) => {
      const fontName = this.getFontName(font.token);
      const loaded = loadedFonts[fontName] === true;
      return (
        <div
          key={font.token}
          className="gallery-grid-item gallery-font-item"
          onClick={() => this.openPreview({ token: font.token })}>
          <div
            className="gallery-img-wrapper gallery-font-wrapper"
            style={loaded ? { fontFamily: `"${fontName}"` } : undefined}>
            <span>{t('gallery.fontThumbnailText')}</span>
          </div>
          <div className="gallery-image-name">{fontName}</div>
        </div>
      );
    });
  }

  renderSoundGrid = () => {
    const { allSounds, soundsLoading, loadError } = this.state;
    const filtered = this.getFilteredItems();
    const { t } = this.props;

    if (soundsLoading) {
      return <div className="gallery-no-images">{t('gallery.loading')}</div>;
    }
    if (loadError) {
      return <div className="gallery-no-images gallery-error">{t('gallery.loadError')}</div>;
    }
    if (allSounds.length === 0) {
      return <div className="gallery-no-images">{t('gallery.noSounds')}</div>;
    }
    if (filtered.length === 0) {
      return <div className="gallery-no-images">{t('gallery.emptyCategory')}</div>;
    }

    return filtered.map((sound) => {
      const displayName = this.formatDisplayName(sound.fileName);
      return (
        <div
          key={sound.fullPath}
          className="gallery-grid-item gallery-sound-item"
          onClick={() => this.openPreview({ ...sound })}>
          <div className="gallery-sound-icon">♪</div>
          <div className="gallery-image-name">{displayName}</div>
        </div>
      );
    });
  }

  renderWickobjGrid = () => {
    const { wickobjs, wickobjsLoading, loadError } = this.state;
    const filtered = this.getFilteredItems();
    const { t } = this.props;

    if (wickobjsLoading) {
      return <div className="gallery-no-images">{t('gallery.loading')}</div>;
    }
    if (loadError) {
      return <div className="gallery-no-images gallery-error">{t('gallery.loadError')}</div>;
    }
    if (wickobjs.length === 0) {
      return <div className="gallery-no-images">{t('gallery.noWickobjs')}</div>;
    }
    if (filtered.length === 0) {
      return <div className="gallery-no-images">{t('gallery.emptyCategory')}</div>;
    }

    return filtered.map((obj) => {
      const displayName = this.formatDisplayName(obj.fileName);
      return (
        <div
          key={obj.fullPath}
          className="gallery-grid-item gallery-wickobj-item"
          onClick={() => this.openPreview({ ...obj })}>
          <div className="gallery-wickobj-icon"><span role="img" aria-label={displayName}>🕹️</span></div>
          <div className="gallery-image-name">{displayName}</div>
        </div>
      );
    });
  }

  renderTabContent = () => {
    const { activeTab } = this.state;
    if (activeTab === 'images') {
      return this.renderImageGrid();
    }
    if (activeTab === 'fonts') {
      return this.renderFontGrid();
    }
    if (activeTab === 'sounds') {
      return this.renderSoundGrid();
    }
    return this.renderWickobjGrid();
  }

  renderCategoriesRow = () => {
    const { activeTab } = this.state;
    if (activeTab === 'images' || activeTab === 'sounds') {
      return (
        <div className="gallery-categories">
          {this.renderCategories()}
        </div>
      );
    }
    return null;
  }

  loadSoundSrc = (fullPath) => {
    return fetch(this.getSoundUrl(fullPath))
      .then((response) => response.blob())
      .then((blob) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      });
  }

  renderPreviewModal = () => {
    const { selectedItem, activeTab } = this.state;
    const { t } = this.props;
    if (!selectedItem) return null;

    const isFont = activeTab === 'fonts';
    const isSound = activeTab === 'sounds';
    const isWickobj = activeTab === 'wickobjs';
    const displayName = selectedItem.displayName;

    let previewContent = null;
    if (isFont) {
      const fontName = this.getFontName(selectedItem.token);
      previewContent = (
        <div
          className="gallery-font-preview"
          style={this.state.loadedFonts[fontName] === true ? { fontFamily: `"${fontName}"` } : undefined}>
          {t('gallery.fontPreviewText')}
        </div>
      );
    } else if (isSound) {
      previewContent = (
        <AudioPlayer
          src={selectedItem.src}
          loadSrc={() => {
            this.loadSoundSrc(selectedItem.fullPath).then((dataUrl) => {
              this.setState(prevState => ({
                selectedItem: { ...prevState.selectedItem, src: dataUrl },
              }));
            });
          }}
        />
      );
    } else if (isWickobj) {
      previewContent = (
        <div className="gallery-wickobj-preview">
          {selectedItem.description ? selectedItem.description : t('gallery.noDescription')}
        </div>
      );
    } else {
      previewContent = (
        <div className="gallery-preview-img-wrapper">
          <img src={selectedItem.url} alt={displayName} />
        </div>
      );
    }

    return (
      <div className="gallery-preview-overlay" onClick={this.closePreview}>
        <div className="gallery-preview-card" onClick={(e) => e.stopPropagation()}>
          {previewContent}
          <div className="gallery-image-name gallery-preview-name">{displayName}</div>
          <div className="gallery-preview-actions">
            <button
              className="gallery-modal-btn gallery-modal-btn-primary"
              onClick={this.insertItem}
              disabled={this.state.inserting}>
              {this.state.inserting ? t('gallery.inserting') : t('gallery.insert')}
            </button>
            <button className="gallery-modal-btn gallery-modal-btn-secondary" onClick={this.closePreview}>
              {t('gallery.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  render () {
    const { t } = this.props;
    return (
      <WickModal
        open={this.props.open}
        toggle={this.props.toggle}
        className="modal-body gallery-modal-body"
        overlayClassName="modal-overlay gallery-modal-overlay">
        <div className="gallery-modal">
          <div className="gallery-modal-title">
            {t('gallery.title')}
          </div>
          <div className="gallery-tabs">
            {this.renderTabs()}
          </div>
          {this.renderCategoriesRow()}
          <div className="gallery-scroll">
            <div className="gallery-grid">
              {this.renderTabContent()}
            </div>
          </div>
          <div className="gallery-footer-note">{t('gallery.footer')}</div>
        </div>
        {this.renderPreviewModal()}
      </WickModal>
    );
  }
}

export default withTranslation()(Gallery);
