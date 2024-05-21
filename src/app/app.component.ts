import { Component, Input } from '@angular/core';
import Quill, { Delta, RangeStatic } from 'quill';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @Input()
  message: string;

  quill: Quill;

  getEditorInstance(event: Quill): void {
    this.quill = event;
    const toolbar: any = this.quill.getModule('toolbar');
    const clipboard: any = this.quill.getModule('clipboard');
    toolbar.addHandler('image', this.customImageHandler);
    clipboard.addMatcher('*', this.customImagePasteHandler);
  }

  getMessage(): string {
    return this.message;
  }

  contentChanged(obj: any): void {
    this.message = obj.html;
  }

  /**
   * Handles custom image insertion into the Quill editor.
   * 
   * This method is defined as an arrow function to ensure lexical binding of 'this'.
   * When used as a callback, arrow functions maintain the context of the surrounding class,
   * allowing access to class properties and methods via 'this'.
   * 
   * @param {boolean} openExplorer indicating whether to open the file explorer to select an image.
   * @returns void
   */
  customImageHandler = (openExplorer: boolean) => {
    if (openExplorer) {
      this.handleFileExplorer().then((result: string) => {
        this.insertImageAtRange(result);
      }).catch((error: Error) => {
        console.error(error);
      });
    }
  }
  
  insertImageAtRange(base64String) {
    const range: RangeStatic = this.quill.getSelection();
    this.quill.insertEmbed(range.index, 'image', base64String, 'user');
  }

  handleFileExplorer(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const fileInput: HTMLInputElement = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/png, image/jpeg";
        fileInput.onchange = (event) => {
          const file: File | null = (event.target as HTMLInputElement).files?.[0] || null;
          if (!file) {
            reject(new Error("No file selected."));
            return;
          }

          const reader: FileReader = new FileReader();
          reader.onload = () => {
            const base64String: string | null = reader.result as string;
            if (base64String) {
              resolve(base64String);
            } else {
              reject(new Error("Failed to read the file."));
            }
          };
          reader.onerror = () => {
            reject(new Error("Error reading the file."));
          };
          reader.readAsDataURL(file);
        };

        fileInput.click();
      } catch (error) {
        reject(error);
      }
    });
  }

  customImagePasteHandler(node: HTMLElement, delta: Delta) {
    if (node && delta) {
      console.log(node);
      console.log(delta);
    }
    return delta;
  }
}