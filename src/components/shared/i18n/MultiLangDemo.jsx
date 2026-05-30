import { useState } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import MultiLangInput from "./MultiLangInput";
import MultiLangText from "./MultiLangText";

/**
 * Smoke-test page for the MultiLangInput / MultiLangText pair.
 * Mount under any route during development to verify the toggle ON/OFF flow,
 * the "Translate now" button, and the auto badge after the FE writes a value.
 *
 *   import MultiLangDemo from "@/components/shared/i18n/MultiLangDemo";
 *   <Route path="/dev/i18n" element={<MultiLangDemo />} />
 */
export default function MultiLangDemo() {
  const [title, setTitle] = useState({ vi: "Xin chào", _source: "vi" });
  const [body, setBody] = useState({});

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">MultiLangInput demo</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          <MultiLangInput
            value={title}
            onChange={setTitle}
            label="Tiêu đề"
            placeholder="Nhập tiêu đề..."
            resourceType="notification.title"
            intent="CUSTOMER_FACING_UI"
            isRequired
          />
          <MultiLangInput
            value={body}
            onChange={setBody}
            label="Nội dung"
            placeholder="Nhập nội dung..."
            resourceType="notification.body"
            intent="CUSTOMER_FACING_UI"
            multiline
            defaultAutoTranslate={false}
          />
          <Button
            onClick={() => {
              setTitle({});
              setBody({});
            }}
          >
            Reset
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">MultiLangText (read view)</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          <p>
            Title: <MultiLangText value={title} />
          </p>
          <p>
            Body: <MultiLangText value={body} fallback="(empty)" />
          </p>
          <details className="text-xs">
            <summary className="cursor-pointer">Raw JSON</summary>
            <pre className="bg-default-100 rounded p-2 overflow-auto">
              {JSON.stringify({ title, body }, null, 2)}
            </pre>
          </details>
        </CardBody>
      </Card>
    </div>
  );
}
