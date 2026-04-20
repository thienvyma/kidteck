export const LANDING_EDITOR_SECTIONS = [
  {
    id: 'header',
    label: 'Header',
    badge: 'Menu',
    title: 'Header',
    lead: 'Chỉnh nhãn điều hướng và CTA ở phần đầu landing.',
    contentKey: 'header',
    previewTarget: 'hero',
    fieldGroups: [
      {
        layout: 'grid',
        fields: [
          { key: 'contactLabel', label: 'Nhan Lien he', type: 'text' },
          { key: 'roadmapLabel', label: 'Nhãn Lộ trình', type: 'text' },
          { key: 'faqLabel', label: 'Nhãn FAQ', type: 'text' },
        ],
      },
      {
        layout: 'stack',
        fields: [
          { key: 'ctaLabel', label: 'CTA trên header', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'hero',
    label: 'Hero',
    badge: 'Banner',
    title: 'Hero',
    lead: 'Thông điệp đầu trang, CTA và trust points.',
    contentKey: 'hero',
    previewTarget: 'hero',
    fieldGroups: [
      {
        layout: 'grid',
        fields: [
          { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
          { key: 'title', label: 'Tiêu đề', type: 'text' },
        ],
      },
      {
        layout: 'stack',
        fields: [
          { key: 'description', label: 'Mô tả', type: 'textarea', rows: 4 },
        ],
      },
      {
        layout: 'grid',
        fields: [
          { key: 'primaryCtaLabel', label: 'CTA chính', type: 'text' },
          { key: 'secondaryCtaLabel', label: 'CTA phụ', type: 'text' },
        ],
      },
      {
        layout: 'stack',
        fields: [
          {
            key: 'trustItems',
            label: 'Trust items',
            type: 'textarea-list',
            rows: 4,
            helpText: 'Mỗi dòng là một item.',
          },
        ],
      },
    ],
  },
  {
    id: 'solution',
    label: 'Positioning',
    badge: 'Story',
    title: 'Positioning / Solution',
    lead: 'Thông điệp định vị, so sánh trước/sau và các trụ tư duy.',
    contentKey: 'solution',
    previewTarget: 'solution',
    fieldGroups: [
      {
        layout: 'grid',
        fields: [
          { key: 'title', label: 'Tiêu đề section', type: 'text' },
          { key: 'subtitle', label: 'Subtitle', type: 'text' },
        ],
      },
    ],
    editorBlocks: [
      {
        type: 'comparison',
        title: 'Before / after comparison',
        note: 'Ẩn khối này nếu muốn bỏ phần so sánh trước/sau nhưng vẫn giữ pillars bên dưới.',
        visibilityKey: 'showComparison',
        hideLabel: 'Ẩn khối before / after',
        showLabel: 'Hiện lại khối before / after',
        columns: [
          { titleKey: 'beforeTitle', itemsKey: 'beforeItems', label: 'Cột trước', rows: 5 },
          { titleKey: 'afterTitle', itemsKey: 'afterItems', label: 'Cột sau', rows: 5 },
        ],
      },
      {
        type: 'repeater',
        arrayField: 'pillars',
        title: 'Solution pillars',
        note: 'Không render quá 4 card ở desktop vì layout public hiện tại đang chia 4 cột.',
        minItems: 1,
        maxItems: 4,
        addLabel: 'Thêm pillar',
        itemTitlePrefix: 'Pillar',
        createItem: 'card',
        itemShape: 'icon-title-description',
      },
    ],
  },
  {
    id: 'catalog',
    label: 'Roadmap',
    badge: 'Sync',
    title: 'Roadmap',
    lead: 'Khối này chỉ đọc để đảm bảo card roadmap luôn khớp với dữ liệu khóa học thật.',
    contentKey: null,
    previewTarget: 'roadmap',
    editorBlocks: [
      {
        type: 'note',
        title: 'Roadmap',
        text:
          'Level, mô tả, học phí, thời lượng và danh sách môn đang lấy trực tiếp từ phần Khóa học trong admin. Tiêu đề khối roadmap ngoài landing hiện vẫn là nội dung cố định trong public page.',
      },
    ],
  },
  {
    id: 'results',
    label: 'Results',
    badge: 'Outcome',
    title: 'Results',
    lead: 'Khối before/after và các output mà học viên có thể tạo ra.',
    contentKey: 'results',
    previewTarget: 'results',
    fieldGroups: [
      {
        layout: 'grid',
        fields: [
          { key: 'title', label: 'Tiêu đề section', type: 'text' },
          { key: 'subtitle', label: 'Subtitle', type: 'text' },
        ],
      },
    ],
    editorBlocks: [
      {
        type: 'comparison',
        columns: [
          { titleKey: 'beforeTitle', itemsKey: 'beforeItems', label: 'Cột trước', rows: 5 },
          { titleKey: 'afterTitle', itemsKey: 'afterItems', label: 'Cột sau', rows: 5 },
        ],
      },
      {
        type: 'repeater',
        arrayField: 'showcaseItems',
        title: 'Result showcase',
        note: 'Không render quá 4 showcase card ở desktop vì layout public hiện tại đang chia 4 cột.',
        minItems: 1,
        maxItems: 4,
        addLabel: 'Thêm showcase',
        itemTitlePrefix: 'Showcase',
        createItem: 'card',
        itemShape: 'icon-title-description',
      },
    ],
  },
  {
    id: 'method',
    label: 'Method',
    badge: 'Studio',
    title: 'Method',
    lead: 'Cách học, nhịp mentor và trải nghiệm kiểu studio nhỏ.',
    contentKey: 'method',
    previewTarget: 'method',
    fieldGroups: [
      {
        layout: 'grid',
        fields: [
          { key: 'title', label: 'Tiêu đề section', type: 'text' },
          { key: 'subtitle', label: 'Subtitle', type: 'text' },
        ],
      },
    ],
    editorBlocks: [
      {
        type: 'fixed-items',
        arrayField: 'items',
        itemTitlePrefix: 'Method item',
        itemShape: 'icon-title-description',
      },
    ],
  },
  {
    id: 'commitment',
    label: 'Commitment',
    badge: 'Trust',
    title: 'Commitment',
    lead: 'Các điểm phụ huynh có thể kiểm chứng trong quá trình học.',
    contentKey: 'commitment',
    previewTarget: 'commitment',
    fieldGroups: [
      {
        layout: 'grid',
        fields: [
          { key: 'title', label: 'Tiêu đề section', type: 'text' },
          { key: 'subtitle', label: 'Subtitle', type: 'text' },
        ],
      },
    ],
    editorBlocks: [
      {
        type: 'field-card',
        title: 'Khối guarantee / hoàn tiền',
        note: 'Ẩn khối này nếu muốn bỏ phần cam kết buổi học đầu nhưng vẫn giữ các card commitment phía trên.',
        visibilityKey: 'showGuarantee',
        hideLabel: 'Ẩn khối guarantee',
        showLabel: 'Hiện lại khối guarantee',
        layout: 'grid',
        fields: [
          { key: 'guaranteeTitle', label: 'Tiêu đề guarantee', type: 'text' },
          { key: 'guaranteeText', label: 'Mô tả guarantee', type: 'textarea', rows: 3 },
        ],
      },
      {
        type: 'fixed-items',
        arrayField: 'items',
        itemTitlePrefix: 'Commitment item',
        itemShape: 'icon-title-description',
      },
    ],
  },
  {
    id: 'faq',
    label: 'FAQ',
    badge: 'Answer',
    title: 'FAQ',
    lead: 'Các câu hỏi thường gặp ở cuối landing.',
    contentKey: 'faq',
    previewTarget: 'faq',
    fieldGroups: [
      {
        layout: 'grid',
        fields: [
          { key: 'title', label: 'Tiêu đề section', type: 'text' },
          { key: 'subtitle', label: 'Subtitle', type: 'text' },
        ],
      },
    ],
    editorBlocks: [
      {
        type: 'repeater',
        arrayField: 'items',
        title: 'FAQ items',
        note: 'Landing public sẽ bỏ qua item rỗng, nên bạn có thể thêm trước rồi điền nội dung sau.',
        minItems: 1,
        addLabel: 'Thêm FAQ',
        itemTitlePrefix: 'FAQ',
        createItem: 'faq',
        itemShape: 'question-answer',
      },
    ],
  },
  {
    id: 'cta',
    label: 'CTA',
    badge: 'Lead',
    title: 'CTA cuối trang',
    lead: 'Khối chốt cuối trang và form nhận tư vấn.',
    contentKey: 'cta',
    previewTarget: 'cta',
    fieldGroups: [
      {
        layout: 'stack',
        fields: [
          { key: 'title', label: 'Tiêu đề', type: 'text' },
          { key: 'description', label: 'Mô tả', type: 'textarea', rows: 4 },
          {
            key: 'benefits',
            label: 'Benefits',
            type: 'textarea-list',
            rows: 4,
            helpText: 'Mỗi dòng là một benefit.',
          },
        ],
      },
      {
        layout: 'grid',
        fields: [
          { key: 'formTitle', label: 'Tiêu đề form', type: 'text' },
          { key: 'submitLabel', label: 'Nhãn nút submit', type: 'text' },
        ],
      },
      {
        layout: 'stack',
        fields: [
          { key: 'formNote', label: 'Ghi chú form', type: 'textarea', rows: 3 },
        ],
      },
    ],
  },
  {
    id: 'contact',
    label: 'Liên hệ',
    badge: 'Direct',
    title: 'Liên hệ trực tiếp',
    lead:
      'Chỉnh sửa khối thông tin Liên hệ trực tiếp. Các nút hành động trong khối này vẫn tự động lấy từ mục Footer.',
    contentKey: 'contactDirect',
    previewTarget: 'contact-direct',
    fieldGroups: [
      {
        layout: 'stack',
        fields: [
          { key: 'title', label: 'Tiêu đề chính', type: 'text' },
          { key: 'subtitle', label: 'Tiêu đề phụ (mô tả)', type: 'textarea', rows: 3 },
        ],
      },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    badge: 'Brand',
    title: 'Footer',
    lead: 'Chỉnh phần brand, quick links, contact links và copyright ở cuối trang.',
    contentKey: 'footer',
    previewTarget: 'footer',
    fieldGroups: [
      {
        layout: 'grid',
        fields: [
          { key: 'logoSubtitle', label: 'Logo subtitle', type: 'text' },
          { key: 'roadmapTitle', label: 'Tiêu đề cột Lộ trình', type: 'text' },
        ],
      },
      {
        layout: 'stack',
        fields: [
          { key: 'description', label: 'Mô tả brand', type: 'textarea', rows: 4 },
        ],
      },
      {
        layout: 'grid',
        fields: [
          { key: 'quickLinksTitle', label: 'Tiêu đề cột Thông tin', type: 'text' },
          { key: 'contactTitle', label: 'Tiêu đề cột Liên hệ', type: 'text' },
          { key: 'faqLabel', label: 'Nhãn link FAQ', type: 'text' },
          { key: 'commitmentLabel', label: 'Nhãn link Commitment', type: 'text' },
          { key: 'ctaLabel', label: 'Nhãn link CTA', type: 'text' },
          { key: 'copyright', label: 'Copyright', type: 'text' },
        ],
      },
    ],
    editorBlocks: [
      {
        type: 'repeater',
        arrayField: 'contactLinks',
        title: 'Footer contact links',
        note: 'Nhóm này được dùng cả ở footer lẫn ở khối Liên hệ trực tiếp trên landing.',
        minItems: 1,
        addLabel: 'Thêm contact link',
        itemTitlePrefix: 'Contact link',
        createItem: 'link',
        itemShape: 'label-href',
      },
    ],
  },
]

export const LANDING_EDITOR_SECTION_MAP = Object.fromEntries(
  LANDING_EDITOR_SECTIONS.map((section) => [section.id, section])
)
