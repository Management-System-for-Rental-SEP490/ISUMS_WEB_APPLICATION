import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { CONTRACT_HTML_STYLES } from "../../utils/contractHtml.utils";

export default function ContractHtmlEditor({
  initialHtml,
  onChange,
  onEditorReady,
}) {
  const [value, setValue] = useState(initialHtml || "<p></p>");

  useEffect(() => {
    setValue(initialHtml || "<p></p>");
  }, [initialHtml]);

  return (
    <div className="space-y-3">
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        value={value}
        licenseKey="gpl"
        onEditorChange={(content) => {
          setValue(content);
          onChange?.(content);
        }}
        init={{
          ...(onEditorReady && {
            setup: (editor) => {
              editor.on("init", () => {
                onEditorReady(editor);
              });
            },
          }),
          height: 800,
          branding: false,
          menubar: "file edit view insert format table tools help",
          plugins:
            "advlist autolink lists link charmap preview anchor " +
            "searchreplace visualblocks code fullscreen " +
            "insertdatetime table help wordcount",
          toolbar:
            "undo redo | styleselect | bold italic underline strikethrough | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | forecolor backcolor | " +
            "table | removeformat | code fullscreen",
          content_style: CONTRACT_HTML_STYLES,
          base_url: "/tinymce",
          suffix: ".min",
        }}
      />
    </div>
  );
}
