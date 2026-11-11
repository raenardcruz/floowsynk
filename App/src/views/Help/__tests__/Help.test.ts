import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Help from '../Help.vue';
import InteractiveTour from '../components/InteractiveTour.vue';
import HelpWorkflowCanvas from '../components/HelpWorkflowCanvas.vue';
import NodeCatalogBrowser from '../components/NodeCatalogBrowser.vue';
import FaqSection from '../components/FaqSection.vue';
import { TOUR_STEPS, SAMPLE_WORKFLOWS, NODE_CATALOG, FAQ_ITEMS } from '../Help.constants';

const mockPush = vi.fn();

vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mockPush
    }),
    useRoute: () => ({
        path: '/help'
    })
}));

vi.mock('proto/workflow/workflow_grpc_web_pb', () => ({
    WorkflowServicePromiseClient: vi.fn().mockImplementation(() => ({
        quickRun: vi.fn(),
        listConnectors: vi.fn().mockResolvedValue({ getConnectorsList: () => [] }),
        getWorkflow: vi.fn(),
        updateWorkflow: vi.fn(),
        createWorkflow: vi.fn()
    }))
}));

vi.mock('primevue/usetoast', () => ({
    useToast: () => ({
        add: vi.fn()
    })
}));

// Mock @vue-flow/core methods if needed
vi.mock('@vue-flow/core', async () => {
    const actual = await vi.importActual<any>('@vue-flow/core');
    return {
        ...actual,
        useVueFlow: () => ({
            setViewport: vi.fn(),
            fitView: vi.fn(),
            screenToFlowCoordinate: vi.fn((pos: any) => pos)
        })
    };
});

describe('Help & Live Sample Workflow View (Redesigned)', () => {
    it('renders the main Help view with hero banner, studio, sample library, catalog, and FAQ without 3js', () => {
        const wrapper = mount(Help, {
            global: {
                stubs: {
                    'router-link': {
                        template: '<a><slot /></a>'
                    },
                    HelpWorkflowCanvas: true
                }
            }
        });

        expect(wrapper.find('.hero-title').text()).toContain('Master Floowsynk Workflow Orchestration');
        expect(wrapper.findComponent(InteractiveTour).exists()).toBe(true);
        expect(wrapper.findComponent(HelpWorkflowCanvas).exists()).toBe(true);
        expect(wrapper.findComponent(NodeCatalogBrowser).exists()).toBe(true);
        expect(wrapper.findComponent(FaqSection).exists()).toBe(true);

        // Verify Quick Start 3-step cards are rendered
        const quickCards = wrapper.findAll('.quick-card');
        expect(quickCards.length).toBe(3);
        expect(quickCards[0].text()).toContain('Real Visual Canvas');
        expect(quickCards[1].text()).toContain('Goja JavaScript');
        expect(quickCards[2].text()).toContain('Pin Data & Replay Logs');

        // Verify Section Navigation Tabs
        const navTabs = wrapper.findAll('.nav-tab-btn');
        expect(navTabs.length).toBe(5); // Interactive Studio & Tour, Sample Workflows, Node Catalog, FAQ & Docs, View All

        // Verify Sample Library Cards
        const sampleCards = wrapper.findAll('.sample-library-card');
        expect(sampleCards.length).toBe(SAMPLE_WORKFLOWS.length);
        expect(sampleCards[0].text()).toContain('Webhook Data Pipeline & Goja JS');
    });

    it('switches sections using navigation tabs and toggles full-width canvas mode', async () => {
        const wrapper = mount(Help, {
            global: {
                stubs: {
                    'router-link': {
                        template: '<a><slot /></a>'
                    },
                    HelpWorkflowCanvas: true
                }
            }
        });

        const navTabs = wrapper.findAll('.nav-tab-btn');

        // Switch to Sample Workflows
        await navTabs[1].trigger('click');
        expect(navTabs[1].classes()).toContain('active');

        // Switch to Node Catalog
        await navTabs[2].trigger('click');
        expect(navTabs[2].classes()).toContain('active');

        // Switch to FAQ
        await navTabs[3].trigger('click');
        expect(navTabs[3].classes()).toContain('active');

        // Switch back to Interactive Studio
        await navTabs[0].trigger('click');
        expect(navTabs[0].classes()).toContain('active');

        // Toggle full-width canvas mode
        const toggleBtn = wrapper.find('.toggle-layout-btn');
        expect(toggleBtn.text()).toContain('Full-Width Canvas Mode');
        await toggleBtn.trigger('click');
        expect(toggleBtn.text()).toContain('Show Walkthrough Guide');
        expect(wrapper.find('.split-studio-grid').classes()).toContain('focus-mode');

        // Toggle it back
        await toggleBtn.trigger('click');
        expect(toggleBtn.text()).toContain('Full-Width Canvas Mode');
        expect(wrapper.find('.split-studio-grid').classes()).not.toContain('focus-mode');
    });

    it('steps through chapters in InteractiveTour and emits canvas events', async () => {
        const wrapper = mount(InteractiveTour, {
            props: {
                activeStepIndex: 0
            }
        });

        expect(wrapper.find('.step-main-title').text()).toBe(TOUR_STEPS[0].title);
        expect(wrapper.findAll('.chapter-pill').length).toBe(7);

        // Click Next button
        const nextBtn = wrapper.find('.nav-step-btn.next');
        await nextBtn.trigger('click');
        expect(wrapper.emitted('update:activeStepIndex')?.[0]).toEqual([1]);

        // Click Chapter 3 (Goja JS)
        const pills = wrapper.findAll('.chapter-pill');
        await pills[2].trigger('click');
        expect(wrapper.emitted('update:activeStepIndex')?.[1]).toEqual([2]);

        // Toggle Auto-Walkthrough
        const autoBtn = wrapper.find('.autoplay-btn');
        expect(autoBtn.text()).toContain('Auto-Walkthrough');
        await autoBtn.trigger('click');
        expect(autoBtn.text()).toContain('Pause Tour');

        // Change speed to Fast (3s)
        const speedChips = wrapper.findAll('.speed-chip');
        await speedChips[2].trigger('click');
        expect(speedChips[2].classes()).toContain('active');

        // Click Run Test button
        const runTestBtn = wrapper.find('.run-test-pill-btn');
        await runTestBtn.trigger('click');
        expect(wrapper.emitted('run-test')).toBeTruthy();
    });

    it('renders HelpWorkflowCanvas with sample workflows, switches samples and executes test', async () => {
        const wrapper = mount(HelpWorkflowCanvas, {
            props: {
                modelValueSampleId: SAMPLE_WORKFLOWS[0].id,
                isDark: true
            },
            global: {
                stubs: {
                    VueFlow: {
                        template: '<div class="vue-flow-mock"><slot /><slot name="node-default" /><slot name="edge-custom" /></div>'
                    },
                    Background: true,
                    MiniMap: true,
                    Controls: true,
                    ControlButton: true,
                    SidebarCanvas: true,
                    WorkflowNodeSidebarFields: true,
                    ReplaySteps: true,
                    FloowsynkNode: {
                        template: '<div class="floowsynk-node-stub" />',
                        props: ['id', 'type', 'data', 'selected', 'tabid']
                    },
                    CustomEdge: {
                        template: '<div class="custom-edge-stub" />',
                        props: ['id', 'source', 'target', 'tabId', 'sourceX', 'sourceY', 'targetX', 'targetY']
                    }
                }
            }
        });

        // Verify sample workflow buttons exist
        const samplePills = wrapper.findAll('.sample-pill-btn');
        expect(samplePills.length).toBe(SAMPLE_WORKFLOWS.length);
        expect(samplePills[0].text()).toContain('Webhook Data Pipeline & Goja JS');

        // Switch to Sample 2 (Linear)
        await samplePills[1].trigger('click');
        expect(wrapper.emitted('update:modelValueSampleId')?.[0]).toEqual([SAMPLE_WORKFLOWS[1].id]);

        // Run workflow test
        const runBtn = wrapper.find('.run-btn');
        expect(runBtn.exists()).toBe(true);
        await runBtn.trigger('click');
        expect(wrapper.find('.exit-run-btn').exists()).toBe(true);

        // Reset sample
        const resetBtn = wrapper.find('.reset-btn');
        await resetBtn.trigger('click');

        // Clone to studio
        const cloneBtn = wrapper.find('.clone-btn');
        await cloneBtn.trigger('click');
        expect(mockPush).toHaveBeenCalledWith('/workflow');
    });

    it('filters NodeCatalogBrowser by category and search query', async () => {
        const wrapper = mount(NodeCatalogBrowser);
        expect(wrapper.findAll('.node-catalog-card').length).toBe(NODE_CATALOG.length);

        const searchInput = wrapper.find('.catalog-search-input');
        await searchInput.setValue('linear');
        expect(wrapper.findAll('.node-catalog-card').length).toBe(1);
        expect(wrapper.find('.node-card-title').text()).toContain('Linear Connector');
    });

    it('searches and toggles FAQ accordion items in FaqSection', async () => {
        const wrapper = mount(FaqSection);
        expect(wrapper.findAll('.faq-item').length).toBe(FAQ_ITEMS.length);

        const searchInput = wrapper.find('.faq-search-input');
        await searchInput.setValue('SSRF');
        expect(wrapper.findAll('.faq-item').length).toBe(1);
        expect(wrapper.find('.faq-q-text').text()).toContain('SSRF');
    });

    it('generates valid CSS selector-friendly canvas IDs preventing Teleport DOMExceptions', async () => {
        const { getCanvasElementId } = await import('../../Workflow/Nodes/FloowsynkNode.hooks');

        // Test tabs that previously generated trailing '==' or invalid characters from btoa
        const testTabs = [
            'help-sample-webhook',
            'help-sample-routing',
            'help-sample-linear',
            'help-sample-rag',
            'main',
            '23b20468-b80c-4ec7-91f8-00a455a15a8c'
        ];

        for (const tabId of testTabs) {
            const canvasId = getCanvasElementId(tabId);
            expect(canvasId).toMatch(/^canvas-[a-zA-Z0-9_-]+$/);
            expect(canvasId).not.toContain('=');

            // Verify document.querySelector can execute the selector without throwing DOMException
            const div = document.createElement('div');
            div.id = canvasId;
            document.body.appendChild(div);

            expect(() => {
                const found = document.querySelector(`#${canvasId}`);
                expect(found).toBe(div);
            }).not.toThrow();

            document.body.removeChild(div);
        }
    });
});

